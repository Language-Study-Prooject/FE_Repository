# Package & Project Structure Info

AI 기반 음성 인터뷰·언어 연습 시스템 프론트엔드

---

## NPM Dependencies

### Core
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `react` | ^19.0.0 | UI 라이브러리 |
| `react-dom` | ^19.0.0 | React DOM 렌더링 |
| `react-router-dom` | ^7.0.0 | 클라이언트 사이드 라우팅 |

### State Management
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `@reduxjs/toolkit` | ^2.0.0 | Redux 상태관리 (slice, thunk 포함) |
| `react-redux` | ^9.0.0 | React-Redux 바인딩 |

### UI Framework
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `@mui/material` | ^7.0.0 | Material UI 컴포넌트 |
| `@mui/icons-material` | ^7.0.0 | Material 아이콘 |
| `@mui/x-date-pickers` | ^8.0.0 | 날짜/시간 선택 컴포넌트 |
| `@emotion/react` | ^11.14.0 | CSS-in-JS (MUI 의존성) |
| `@emotion/styled` | ^11.14.0 | Styled components (MUI 의존성) |

### HTTP & API
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `axios` | ^1.7.0 | HTTP 클라이언트 (REST API 호출) |

### Utilities
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `date-fns` | ^4.1.0 | 날짜 처리 유틸리티 |

### Dev Dependencies
| 패키지 | 버전 | 설명 |
|--------|------|------|
| `vite` | ^6.0.0 | 빌드 도구 & 개발 서버 |
| `@vitejs/plugin-react` | ^5.0.0 | Vite React 플러그인 |
| `eslint` | ^9.0.0 | 코드 린팅 |
| `eslint-plugin-react-hooks` | ^5.0.0 | React Hooks 규칙 검사 |
| `eslint-plugin-react-refresh` | ^0.4.0 | Fast Refresh 지원 |

---

## Project Structure

```
src/
├── api/                    # API 설정
├── assets/                 # 정적 리소스
├── components/             # 공통 컴포넌트
├── contexts/               # React Context
├── domains/                # 도메인별 기능
├── hooks/                  # 공통 커스텀 훅
├── layouts/                # 레이아웃 컴포넌트
├── pages/                  # 페이지 컴포넌트
├── services/               # 외부 서비스 연동
├── store/                  # Redux 스토어
├── styles/                 # 글로벌 스타일
├── theme/                  # MUI 테마 설정
└── utils/                  # 유틸리티 함수
```

---

## Folder Details

### `/api`
```
api/
└── axios.js          # Axios 인스턴스 설정, 인터셉터 (토큰 주입, 에러 처리)
```

### `/assets`
```
assets/               # 이미지, 폰트, 오디오 등 정적 파일
```

### `/components` - 공통 컴포넌트
```
components/
├── common/           # 범용 UI (Button, Modal, Card, Loading 등)
├── audio/            # 오디오 관련 (AudioPlayer, VoiceRecorder, Waveform)
├── chat/             # 채팅 UI (ChatBubble, MessageList, ChatInput)
└── feedback/         # 피드백 UI (FeedbackCard, ScoreDisplay, GrammarHighlight)
```

### `/contexts`
```
contexts/             # React Context (AuthContext, ThemeContext 등)
```

### `/domains` - 도메인별 기능 (핵심)
```
domains/
├── auth/             # 인증/인가
│   ├── components/   # LoginForm, SignupForm, SocialLogin
│   ├── hooks/        # useAuth
│   ├── services/     # authService (Cognito 연동)
│   └── store/        # authSlice (로그인 상태, 토큰 관리)
│
├── user/             # 회원 관리
│   ├── components/   # UserCard, UserList, UserBadge
│   ├── hooks/        # useUser, useUserSearch
│   ├── services/     # userService (회원 CRUD, 검색)
│   └── store/        # userSlice (회원 목록, 상세 정보)
│
├── profile/          # 프로필 관리
│   ├── components/   # ProfileCard, ProfileEditor, AvatarUpload, LearningStats
│   ├── hooks/        # useProfile, useAvatar
│   ├── services/     # profileService (프로필 조회/수정, 학습 통계)
│   └── store/        # profileSlice (내 프로필, 설정)
│
├── chat/             # 실시간 채팅 (공통)
│   ├── components/   # ChatRoom, MessageBubble, ChatInput, TypingIndicator
│   ├── hooks/        # useChat, useMessages, useTyping
│   ├── services/     # chatService (WebSocket 연결, 메시지 송수신)
│   └── store/        # chatSlice (채팅방 목록, 메시지 기록, 연결 상태)
│
├── interview/        # 면접 시뮬레이션 모드
│   ├── components/   # InterviewRoom, QuestionCard, AnswerInput, TimerDisplay
│   ├── hooks/        # useInterview, useTimer
│   ├── services/     # interviewService (질문 조회, 답변 제출)
│   └── store/        # interviewSlice (세션 상태, 질문 목록)
│
├── opic/             # OPIC/어학 연습 모드
│   ├── components/   # TopicSelector, LevelBadge, ShadowingPlayer
│   ├── hooks/        # useOPIC, useShadowing
│   ├── services/     # opicService (레벨별 질문, 모범답변)
│   └── store/        # opicSlice (연습 상태, 예상 등급)
│
├── freetalk/         # 프리토킹 (자유 채팅) 모드
│   ├── components/   # FreetalkRoom, VoiceMessage, ReadAloud
│   ├── hooks/        # useFreetalk
│   ├── services/     # freetalkService (AI 대화)
│   └── store/        # freetalkSlice (대화 기록)
│
├── writing/          # 작문 연습 모드
│   ├── components/   # TextEditor, CorrectionView, TemplateSelector
│   ├── hooks/        # useWriting, useGrammarCheck
│   ├── services/     # writingService (문법 교정 요청)
│   └── store/        # writingSlice (작문 상태)
│
└── report/           # 세션 리포트
    ├── components/   # ReportCard, StatisticsChart, AudioPlaylist
    ├── hooks/        # useReport
    ├── services/     # reportService (리포트 조회, 이메일 발송)
    └── store/        # reportSlice (리포트 데이터)
```

#### 도메인 관계도
```
┌─────────────────────────────────────────────────────────────┐
│                        auth (인증)                          │
│                     ↓ 로그인 후 접근                         │
├─────────────────────────────────────────────────────────────┤
│  user (회원)  ←→  profile (프로필)  ←→  chat (실시간 채팅)   │
├─────────────────────────────────────────────────────────────┤
│     ┌──────────────┬──────────────┬──────────────┐          │
│     │  interview   │    opic      │   freetalk   │  학습    │
│     │  (면접)      │   (OPIC)     │  (프리토킹)   │  모드    │
│     └──────┬───────┴──────┬───────┴──────┬───────┘          │
│            │              │              │                   │
│            └──────────────┼──────────────┘                   │
│                           ↓                                  │
│                    writing (작문)                            │
│                           ↓                                  │
│                    report (리포트)                           │
└─────────────────────────────────────────────────────────────┘
```

### `/hooks` - 공통 커스텀 훅
```
hooks/
├── useAudio.js       # 오디오 재생/녹음 제어
├── useWebSocket.js   # WebSocket 연결 관리
├── useDebounce.js    # 디바운스 처리
├── useLocalStorage.js # 로컬 스토리지 접근
└── useMediaQuery.js  # 반응형 브레이크포인트
```

### `/layouts`
```
layouts/
├── MainLayout/       # 메인 레이아웃 (헤더, 사이드바, 푸터)
└── AuthLayout/       # 인증 페이지 레이아웃 (로그인, 회원가입)
```

### `/pages`
```
pages/
├── Home/             # 랜딩 페이지
├── Login/            # 로그인 페이지
├── Dashboard/        # 대시보드 (모드 선택)
└── NotFound/         # 404 페이지
```

### `/services` - 외부 서비스 연동
```
services/
├── api/              # API 공통 래퍼
├── audio/            # AWS Polly (TTS), Transcribe (STT) 연동
├── chat/             # WebSocket 연결 관리 (API Gateway WebSocket)
└── ai/               # Claude/Bedrock AI API 호출
```

### `/store`
```
store/
└── index.js          # Redux store 설정, 미들웨어, 슬라이스 결합
```

### `/styles`
```
styles/               # 글로벌 CSS, CSS 변수, 애니메이션
```

### `/theme`
```
theme/
└── theme.js          # MUI 테마 설정 (색상, 타이포그래피, 컴포넌트 스타일)
```

### `/utils`
```
utils/                # 유틸리티 함수 (formatDate, validateEmail, etc.)
```

---

## AWS Service Integration Map

| 프론트 기능 | 연동 서비스 | 파일 위치 |
|-------------|-------------|-----------|
| 로그인/회원가입 | Cognito | `domains/auth/services/` |
| REST API 호출 | API Gateway | `api/axios.js` |
| 실시간 채팅 | WebSocket API | `services/chat/` |
| 음성 재생 (TTS) | Polly | `services/audio/` |
| 음성 녹음 (STT) | Transcribe + S3 | `services/audio/` |
| AI 대화/피드백 | Bedrock/Claude | `services/ai/` |
| 정적 파일 | S3 + CloudFront | 빌드 배포 |

---

## Scripts

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

---

## Environment Variables

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_API_URL` | REST API 엔드포인트 | `https://api.example.com` |
| `VITE_WS_URL` | WebSocket 엔드포인트 | `wss://ws.example.com` |
| `VITE_COGNITO_POOL_ID` | Cognito User Pool ID | `ap-northeast-2_xxxxx` |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID | `xxxxxxxxxxxxxxxxxx` |
| `VITE_S3_BUCKET` | S3 버킷 URL | `https://bucket.s3.amazonaws.com` |
