# MealNexus - Food Donation Platform

MealNexus is a full-stack web application that connects food donors with NGOs and volunteers to reduce food waste and help feed the needy. The platform features a multi-role system, real-time donation tracking, AI-powered volunteer matching, and comprehensive AWS cloud infrastructure.

## Features

- **Multi-Role System**: Donor, Volunteer, NGO, and Admin portals
- **Food Donations**: Post surplus food with expiry tracking
- **Clothes Donations**: Donate clothes to those in need
- **Money Donations**: Secure payment integration with tax receipts
- **Real-time Tracking**: Track donation status from pickup to delivery
- **Smart Priority**: Auto-priority based on food expiry time
- **AI-Powered Matching**: AWS SageMaker ranks the best volunteers for each donation
- **OTP Verification**: Phone-based login via SMS (Twilio / Fast2SMS)
- **Admin Dashboard**: User verification and platform analytics

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment config |

### Database
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Production cloud database |
| mongodb-memory-server | In-memory fallback for local dev |

### AI / Machine Learning
| Service | Purpose |
|---------|---------|
| AWS SageMaker | Primary AI inference endpoint for volunteer ranking |
| AWS Lambda | Fallback AI ranking (`mealnexus-ai-ranking`) |
| Python Flask | Local AI service (development) |
| scikit-learn | Distance calculations & feature engineering |
| XGBoost | Model training pipeline |

### AWS Cloud Infrastructure
| Service | Purpose |
|---------|---------|
| Amazon ECS | Container orchestration (frontend + backend) |
| Amazon ECR | Container image registry |
| Application Load Balancer | Traffic distribution |
| Amazon S3 | Image uploads & static hosting |
| Amazon SQS | Donation event queue (`mealnexus-donation-events`) |
| Amazon SNS | NGO & volunteer push notifications |
| AWS Lambda | Serverless AI ranking fallback |
| Amazon API Gateway | REST API for Lambda (`mealnexus-ai-api`) |
| AWS CloudFormation / SAM | Infrastructure as Code |
| AWS IAM | Roles & policies (SageMaker execution, ECS tasks) |
| Amazon SageMaker | Custom container endpoint for ML predictions |

### SMS & Notifications
| Service | Purpose |
|---------|---------|
| Twilio | SMS fallback (global) |
| Fast2SMS | India-native SMS delivery (primary) |

### Payments
| Service | Purpose |
|---------|---------|
| Razorpay | Payment gateway integration |

### DevOps & CI/CD
| Service | Purpose |
|---------|---------|
| GitHub Actions | CI/CD pipeline (`.github/workflows/deploy-aws.yml`) |
| Docker | Containerization (frontend, backend, SageMaker) |
| AWS SAM CLI | Local SAM development & deployment |

## Architecture Overview

```
User → ALB → ECS (Frontend / Backend)
                ↓
         MongoDB Atlas
                ↓
         AWS S3 (Images)
                ↓
         SQS → Lambda / SNS
                ↓
         SageMaker Endpoint (AI Ranking)
```

## Project Structure

```
meal-nexus/
├── frontend/          # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/         # Donor | Volunteer | NGO | Admin
│   │   ├── context/       # AuthContext
│   │   └── utils/         # api.js (axios client)
│   ├── Dockerfile
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── routes/            # REST API routes
│   ├── middleware/        # auth.js (JWT)
│   ├── models/            # Mongoose schemas
│   ├── utils/             # awsMessaging.js, sagemakerClient.js
│   ├── Dockerfile
│   └── package.json
├── ai-service/        # Python AI service
│   ├── sagemaker_serving.py      # SageMaker BYOC Flask app
│   ├── Dockerfile.sagemaker      # Production container
│   ├── lambda_ranking.py         # AWS Lambda handler
│   └── scripts/                  # deploy_sagemaker.py, test_sagemaker.py
├── infrastructure/    # AWS SAM / CloudFormation
│   ├── template.yaml             # All AWS resources
│   ├── samconfig.toml
│   └── buildspec-sagemaker.yml
├── docs/              # GitHub Pages documentation
├── .github/workflows/ # CI/CD
│   └── deploy-aws.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v20+
- npm or yarn
- Python 3.11+ (for AI service)
- Docker Desktop (for image builds)
- AWS CLI v2 (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karthik-ganti/meal-nexus.git
cd meal-nexus
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running Locally

1. Start the backend server:
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000 (or 5001 if AirPlay is active)
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

3. Open http://localhost:5173 in your browser

> **Note**: If port 5000 is occupied (macOS AirPlay), the backend auto-falls back to port 5001. Update `frontend/vite.config.js` proxy target accordingly.

### AI Service (Optional)

Run the local AI ranking service:
```bash
cd ai-service
pip install -r requirements.txt
python app.py
# Service runs on http://localhost:3000
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mealnexus
JWT_SECRET=your_jwt_secret_key

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# S3 / SQS / SNS
S3_BUCKET_NAME=your-bucket
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
SNS_NGO_TOPIC_ARN=arn:aws:sns:us-east-1:...
SNS_VOLUNTEER_TOPIC_ARN=arn:aws:sns:us-east-1:...

# SMS
USE_REAL_SMS=true
FAST2SMS_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret

# AI
AI_SERVICE_URL=http://localhost:3000
SAGEMAKER_ENDPOINT_NAME=mealnexus-ranking-dev
SAGEMAKER_REGION=us-east-1
```

## Deployment

### AWS Infrastructure (via GitHub Actions)

Pushes to `main` trigger the `.github/workflows/deploy-aws.yml` pipeline:

1. **test** — Lint & build checks
2. **deploy-infra** — SAM deploy (ECS, ALB, S3, SQS, SNS, Lambda)
3. **build** — Docker build & push to ECR
4. **deploy-ai** — Lambda function update
5. **deploy-sagemaker** — Build image, create SageMaker endpoint
6. **deploy-ecs** — Scale ECS services & verify

### Manual AWS CLI Deploy

```bash
# Deploy CloudFormation stack
cd infrastructure
sam build
sam deploy --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM

# Deploy SageMaker endpoint
./deploy-sagemaker.sh dev
```

## AI Ranking Flow

```
1. Donation Created
2. Backend calls SageMaker endpoint (primary)
3. If SageMaker fails → local Flask AI (fallback)
4. If local fails → nearest-neighbor geospatial search
5. Top 3 volunteers returned → assigned via SQS/SNS
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built for social good
- Helping reduce food waste and feed the needy
- Connecting communities through technology
