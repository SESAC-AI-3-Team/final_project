# 1. CUDA 지원을 위한 NVIDIA L4 기반 최적화 이미지 사용
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

# 2. 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=2.3.2 \
    POETRY_VIRTUALENVS_CREATE=false \
    DEBIAN_FRONTEND=noninteractive

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 필요한 시스템 패키지 및 Python 3.12 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    software-properties-common \
    git \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y --no-install-recommends \
    python3.12 \
    python3.12-dev \
    python3.12-venv \
    build-essential \
    libpq-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 \
    && ln -sf /usr/bin/python3.12 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# 5. Poetry 및 기본 도구 설치
RUN pip install "poetry==$POETRY_VERSION"

# 6. 의존성 파일 복사 및 설치
COPY pyproject.toml poetry.lock* /app/

# Poetry를 사용하여 의존성을 시스템 Python 환경에 설치합니다.
# pyproject.toml이 크게 변경되었으므로 lock 파일을 먼저 동기화합니다.

# RUN poetry config virtualenvs.create false \
#     && if [ ! -f poetry.lock ]; then poetry lock; fi \
#     && poetry install --no-interaction --no-ansi || (poetry lock && poetry install --no-interaction --no-ansi)

RUN poetry config virtualenvs.create false \
    && python -m pip install --upgrade pip \
    && python -m pip install --ignore-installed blinker \
    && poetry install --no-interaction --no-ansi
# 8. 나머지 프로젝트 코드 전체 복사
COPY . /app/


# 9. 포트 개방
EXPOSE 8000

# 10. 서버 실행 명령어
# CMD ["tail", "-f", "/dev/null"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]