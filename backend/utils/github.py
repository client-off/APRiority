import requests
import base64
from backend.config import *

def get_files_from_github_repo(owner, repo, path, token=None):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {}
    if token:
        headers['Authorization'] = f"token {token}"

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        return None

def get_file_content(owner, repo, path, token=None):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {}
    if token:
        headers['Authorization'] = f"token {token}"

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        file_info = response.json()
        if file_info['type'] == 'file':
            content_base64 = file_info['content']
            content = base64.b64decode(content_base64).decode('utf-8')
            return content
        else:
            print(f"{path} is not a file.")
            return None
    else:
        print(f"Error: {response.status_code}")
        return None

# Использование
if __name__ == "__main__":

    # Получаем список файлов
    files = get_files_from_github_repo(owner, repo, collections_folder_path, token)

    if files:
        for file in files:
            print(f"Файл: {file['name']}")
            if file['type'] == 'file':
                # Получаем и выводим содержимое каждого файла
                file_content = get_file_content(owner, repo, file['path'], token)
                print(f"Содержимое {file['name']}:\n{file_co