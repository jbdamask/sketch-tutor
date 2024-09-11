import os

def check_env_var(var_name):
    return var_name in os.environ

print("OPENAI_API_KEY is set:", check_env_var("OPENAI_API_KEY"))
print("DATABASE_URL is set:", check_env_var("DATABASE_URL"))
