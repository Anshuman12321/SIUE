import uvicorn


def main():
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=[".venv/*"],
    )


if __name__ == "__main__":
    main()
