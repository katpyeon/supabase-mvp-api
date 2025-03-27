# Supabase Edge Function REST API

Supabase Edge Function을 활용한 RESTful API 백엔드 프로젝트입니다.

## 목차
- [프로젝트 구조](#프로젝트-구조)
- [로컬 개발 환경 설정](#로컬-개발-환경-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [로컬 실행](#로컬-실행)
- [배포](#배포)
- [API 엔드포인트](#api-엔드포인트)

## 프로젝트 구조

```
supabase-mvp-api/
├── supabase/
│   ├── functions/
│   │   └── posts/
│   │       ├── index.ts
│   │       └── config.toml
│   └── migrations/
└── .env
```

## 로컬 개발 환경 설정

1. Supabase CLI 설치
```bash
brew install supabase/tap/supabase
```

2. 프로젝트 초기화
```bash
supabase init
```

3. 로컬 Supabase 시작
```bash
supabase start
```

## 데이터베이스 설정

1. Supabase Studio 접속
   - 브라우저에서 `http://localhost:54323` 접속
   - Table Editor에서 테이블 생성 및 관리

2. Post 테이블 스키마
   - `id`: UUID (기본키)
   - `title`: 텍스트 (필수)
   - `author`: 텍스트 (필수)
   - `content`: 텍스트 (필수)
   - `created_at`: 타임스탬프 (자동 생성)

⚠️ **주의사항**: 
- 로컬 개발 환경에서는 RLS(Row Level Security)를 비활성화하는 것이 편리합니다.
- 프로덕션 환경에서는 반드시 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

## 로컬 실행

1. Edge Function 실행
```bash
supabase functions serve --no-verify-jwt
```

2. API 테스트
```bash
curl -X POST 'http://localhost:54321/functions/v1/posts' \
  --header 'Content-Type: application/json' \
  --data '{"title": "테스트 제목", "content": "테스트 내용"}'
```

⚠️ **주의사항**: 
- `--no-verify-jwt` 옵션은 로컬 개발 환경에서만 사용하세요.
- 프로덕션 환경에서는 JWT 인증이 필요합니다.
- 인증된 요청을 보낼 때는 `Authorization: Bearer <access_token>` 헤더를 포함해야 합니다.

## 배포

Edge Function 배포
```bash
supabase functions deploy posts
```

## API 엔드포인트

### Base URL
- 로컬: `http://localhost:54321/functions/v1`
- 프로덕션: Supabase 대시보드 > Functions > posts > URL에서 확인 가능

### Posts API

#### GET /posts
- 모든 게시물 조회
- 응답: 게시물 목록

#### GET /posts/:id
- 특정 게시물 조회
- 응답: 게시물 상세 정보

#### GET /posts?q=검색어
- 게시물 검색
- 쿼리 파라미터: q (검색어)

#### POST /posts
- 새 게시물 생성
- 요청 본문:
  ```json
  {
    "title": "제목",
    "author": "작성자",
    "content": "내용"
  }
  ```
- 응답: 생성된 게시물

#### PUT /posts/:id
- 게시물 수정
- 요청 본문:
  ```json
  {
    "title": "수정된 제목",
    "content": "수정된 내용"
  }
  ```
- 응답: 수정된 게시물

#### DELETE /posts/:id
- 게시물 삭제
- 응답: 삭제 성공 여부

## 라이선스

MIT License
 
