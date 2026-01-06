# Issue & Branch Guide

프론트엔드 이슈 발행 및 브랜치 관리 가이드

---

## 이슈 계층 구조

```
Epic (에픽)
  └── Story (스토리)
        └── Task (태스크)
```

| 계층 | 설명 | 예시 |
|------|------|------|
| **Epic** | 대규모 기능 단위 (1~2주 이상) | 메인 레이아웃 구현, 인증 시스템 구축 |
| **Story** | 사용자 관점의 기능 단위 (2~5일) | Header 컴포넌트 개발, 로그인 폼 구현 |
| **Task** | 개발자 작업 단위 (1일 이내) | 로고 배치, 네비게이션 메뉴 구현 |

---

## 이슈 라벨

### 계층 라벨 (필수)
| 라벨 | 색상 | 설명 |
|------|------|------|
| `epic` | `#6B21A8` (보라) | 에픽 이슈 |
| `story` | `#2563EB` (파랑) | 스토리 이슈 |
| `task` | `#16A34A` (초록) | 태스크 이슈 |

### 타입 라벨
| 라벨 | 설명 |
|------|------|
| `feature` | 새 기능 |
| `bug` | 버그 수정 |
| `enhancement` | 개선 |
| `docs` | 문서 |
| `refactor` | 리팩토링 |
| `style` | UI/스타일 |

### 도메인 라벨
| 라벨 | 설명 |
|------|------|
| `domain:auth` | 인증 |
| `domain:user` | 회원 |
| `domain:profile` | 프로필 |
| `domain:chat` | 채팅 |
| `domain:interview` | 면접 |
| `domain:opic` | OPIC |
| `domain:freetalk` | 프리토킹 |
| `domain:writing` | 작문 |
| `domain:report` | 리포트 |
| `domain:layout` | 레이아웃 |

---

## 이슈 템플릿

### Epic 템플릿
```markdown
## Epic: [에픽 제목]

### 목표
[이 에픽을 통해 달성하려는 목표]

### 범위
- [포함되는 기능 1]
- [포함되는 기능 2]

### Stories
- [ ] #스토리이슈번호 - 스토리 제목
- [ ] #스토리이슈번호 - 스토리 제목

### 완료 조건
- [ ] 모든 스토리 완료
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
```

### Story 템플릿
```markdown
## Story: [스토리 제목]

### 상위 Epic
#에픽이슈번호

### 사용자 스토리
[역할]로서, [기능]을 원한다. 그래서 [가치]를 얻을 수 있다.

### 상세 설명
[구현해야 할 내용 상세 설명]

### Tasks
- [ ] #태스크이슈번호 - 태스크 제목
- [ ] #태스크이슈번호 - 태스크 제목

### 완료 조건
- [ ] 기능 구현 완료
- [ ] 반응형 대응
- [ ] 코드 리뷰 완료
```

### Task 템플릿
```markdown
## Task: [태스크 제목]

### 상위 Story
#스토리이슈번호

### 작업 내용
[구체적인 작업 내용]

### 체크리스트
- [ ] 구현
- [ ] 테스트
- [ ] 코드 정리

### 관련 파일
- `src/path/to/file.jsx`
```

---

## 이슈 발행 CLI 명령어

### 라벨 생성 (최초 1회)
```bash
# 계층 라벨
gh label create "epic" --color "6B21A8" --description "에픽 이슈"
gh label create "story" --color "2563EB" --description "스토리 이슈"
gh label create "task" --color "16A34A" --description "태스크 이슈"

# 타입 라벨
gh label create "feature" --color "1D76DB" --description "새 기능"
gh label create "bug" --color "D73A4A" --description "버그 수정"
gh label create "enhancement" --color "A2EEEF" --description "개선"

# 도메인 라벨
gh label create "domain:layout" --color "FEF3C7" --description "레이아웃"
gh label create "domain:auth" --color "FECACA" --description "인증"
gh label create "domain:chat" --color "BBF7D0" --description "채팅"
```

### Epic 발행
```bash
gh issue create \
  --title "[Epic] 메인 레이아웃 구현" \
  --label "epic,feature,domain:layout" \
  --body "## Epic: 메인 레이아웃 구현

### 목표
전체 앱의 기본 레이아웃 구조 구축

### 범위
- Header 영역
- Sidebar 영역
- Main Content 영역
- Footer 영역

### Stories
- [ ] Header 컴포넌트 개발
- [ ] Sidebar 컴포넌트 개발
- [ ] Footer 컴포넌트 개발

### 완료 조건
- [ ] 모든 스토리 완료
- [ ] 반응형 대응 완료"
```

### Story 발행
```bash
gh issue create \
  --title "[Story] Header 컴포넌트 개발" \
  --label "story,feature,domain:layout" \
  --body "## Story: Header 컴포넌트 개발

### 상위 Epic
#1

### 사용자 스토리
사용자로서, 상단 헤더를 통해 주요 메뉴에 접근하고 싶다.

### Tasks
- [ ] 로고 및 타이틀 배치
- [ ] 네비게이션 메뉴 구현
- [ ] 사용자 프로필 드롭다운

### 완료 조건
- [ ] 반응형 대응
- [ ] 다크모드 지원"
```

### Task 발행
```bash
gh issue create \
  --title "[Task] 네비게이션 메뉴 구현" \
  --label "task,feature,domain:layout" \
  --body "## Task: 네비게이션 메뉴 구현

### 상위 Story
#2

### 작업 내용
- 메인 네비게이션 메뉴 구현
- 현재 페이지 하이라이트
- 호버 효과

### 관련 파일
- src/layouts/MainLayout/Header.jsx
- src/layouts/MainLayout/Navigation.jsx"
```

---

## 브랜치 전략

### 브랜치 네이밍 규칙

```
feature/{에픽번호}/{스토리번호}/{태스크번호}/{브랜치명}
```

### 예시
```
main
  └── develop
        └── feature/1/2/3/navigation-menu
              │
              │  Epic #1: 메인 레이아웃 구현
              │  Story #2: Header 컴포넌트 개발
              │  Task #3: 네비게이션 메뉴 구현
              │
              └── 브랜치명: navigation-menu
```

### 브랜치 생성 명령어
```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 태스크 브랜치 생성
# feature/{에픽}/{스토리}/{태스크}/{이름}
git checkout -b feature/1/2/3/navigation-menu

# 작업 후 커밋
git add .
git commit -m "feat(layout): 네비게이션 메뉴 구현 (#3)"

# 푸시
git push origin feature/1/2/3/navigation-menu

# PR 생성
gh pr create \
  --base develop \
  --title "feat(layout): 네비게이션 메뉴 구현" \
  --body "Closes #3

## 작업 내용
- 메인 네비게이션 메뉴 구현
- 현재 페이지 하이라이트

## 스크린샷
[스크린샷 첨부]"
```

---

## 커밋 메시지 컨벤션

### 형식
```
{타입}({스코프}): {제목} (#{이슈번호})

{본문}
```

### 타입
| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 포맷팅, 세미콜론 등 |
| `refactor` | 리팩토링 |
| `test` | 테스트 추가 |
| `chore` | 빌드, 설정 등 |

### 스코프 (도메인)
`layout`, `auth`, `user`, `profile`, `chat`, `interview`, `opic`, `freetalk`, `writing`, `report`

### 예시
```bash
# 기능 추가
git commit -m "feat(layout): Header 컴포넌트 구현 (#3)"

# 버그 수정
git commit -m "fix(auth): 로그인 토큰 만료 처리 (#15)"

# 리팩토링
git commit -m "refactor(chat): WebSocket 연결 로직 개선 (#22)"
```

---

## 워크플로우 요약

```
1. Epic 이슈 생성
   └── gh issue create --title "[Epic] ..."

2. Story 이슈 생성 (Epic 연결)
   └── gh issue create --title "[Story] ..."

3. Task 이슈 생성 (Story 연결)
   └── gh issue create --title "[Task] ..."

4. 브랜치 생성
   └── git checkout -b feature/{에픽}/{스토리}/{태스크}/{이름}

5. 작업 & 커밋
   └── git commit -m "feat(scope): 메시지 (#태스크번호)"

6. PR 생성
   └── gh pr create --base develop

7. 코드 리뷰 & 머지

8. 이슈 자동 종료 (Closes #번호)
```

---

## 이슈 계층 예시 (메인 레이아웃)

```
#1 [Epic] 메인 레이아웃 구현
│
├── #2 [Story] Header 컴포넌트 개발
│     ├── #5 [Task] 로고 및 타이틀 배치
│     ├── #6 [Task] 네비게이션 메뉴 구현
│     └── #7 [Task] 사용자 프로필 드롭다운
│
├── #3 [Story] Sidebar 컴포넌트 개발
│     ├── #8 [Task] 메뉴 리스트 구현
│     └── #9 [Task] 접기/펼치기 기능
│
└── #4 [Story] Footer 컴포넌트 개발
      └── #10 [Task] 푸터 레이아웃 구현
```

### 대응 브랜치
```
feature/1/2/5/logo-title
feature/1/2/6/navigation-menu
feature/1/2/7/user-dropdown
feature/1/3/8/menu-list
feature/1/3/9/sidebar-toggle
feature/1/4/10/footer-layout
```
