# Supabase DB 연결 방법

집수리왕은 기본적으로 브라우저 로컬 저장소로 동작합니다.  
Supabase 설정을 넣으면 노트북, 스마트폰, 다른 PC가 같은 서버 DB 데이터를 보게 됩니다.

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 에 로그인합니다.
2. 새 프로젝트를 만듭니다.
3. 프로젝트의 SQL Editor를 엽니다.
4. 이 저장소의 `supabase_schema.sql` 전체 내용을 실행합니다.

## 2. Project URL과 anon key 확인

Supabase 프로젝트에서 다음 메뉴로 이동합니다.

`Project Settings` -> `API`

아래 값을 확인합니다.

- Project URL
- Project API keys -> anon public

## 3. 앱 설정 파일에 입력

`supabase-config.js` 파일을 열어 아래처럼 입력합니다.

```js
window.SURIKING_SUPABASE = {
  url: "https://프로젝트아이디.supabase.co",
  anonKey: "anon-public-key"
};
```

`deploy/supabase-config.js`도 같은 값으로 맞춘 뒤 서버에 업로드합니다.

## 4. 동작 방식

- 서버 DB 테이블: `public.app_state`
- 행 ID: `live`
- 저장 데이터: 요청, 작업자, 계정 전체 상태 JSON
- 앱 시작 시 DB 데이터를 먼저 불러옵니다.
- 요청 등록, 입찰, 낙찰, 공사 진행, 채팅 등 변경이 생기면 DB에 자동 저장합니다.

## 5. 현재 보안 수준

현재 `supabase_schema.sql`은 필드테스트용으로 anon key CRUD를 허용합니다.  
실제 운영 전에는 Supabase Auth 기반으로 RLS 정책을 좁히는 작업이 필요합니다.

운영 전 권장 작업:

- Supabase Auth 로그인으로 전환
- 요청자는 본인 요청만 조회/수정
- 작업자는 본인 분야 요청과 본인 입찰만 조회/수정
- 관리자는 전체 조회
- 비밀번호 직접 저장 대신 Supabase Auth 사용
