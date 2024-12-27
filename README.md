# Javlib-Web

Javlib 的网页端，主要供移动端访问。

如需外网访问，建议自行下载源码打包，并修改`.env`下的`VITE_LOGIN_TOKEN`配置作为登录验证，本项目提供的默认包的登录验证密码为`VjTeXQXiQwUbmDQH`

### 1Panel 部署

1. 打开 1Panel->网站->网站->创建网站
2. 选择创建静态网站, 填写配置如下

```
主域名: 127.0.0.1:12345 (端口随便填)
代号：12345 (随便填，这是网址文件存储目录)

```

3. 创建完成之后点击配置按钮->配置文件


```
server {
    listen 12345 ;
    server_name 127.0.0.1;
    index index.php index.html index.htm default.php default.htm default.html;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    access_log /www/sites/12345/log/access.log main;
    error_log /www/sites/12345/log/error.log;
    location ^~ /.well-known/acme-challenge {
        allow all;
        root /usr/share/nginx/html;
    }
    root /www/sites/12345/index;
    # 新增代码 start
    # 解决刷新页面404问题
    try_files $uri $uri/ /index.html;
    # 接口代理，用于解决跨域问题
    location /api {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 后台接口地址，端口号根据自己搭建的javlib-server修改
        proxy_pass http://127.0.0.1:15175/api;

        proxy_redirect default;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Headers X-Requested-With;
        add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
    }
    # 新增代码 end
    error_page 404 /404.html;
}
```

4. 将本项目打包后的文件（/dist/）复制到网址目录下

在网址列表中点击网站目录的图标，将本项目pnpm build后的dist文件夹内的文件复制到网站目录下，不包含dist目录

5. 打开浏览器访问 127.0.0.1:12345 （第二步设置的主域名）


### Nginx部署

详细部署互联网自行搜索，Nginx配置如下（同1Panel部署）：

```
server {
    listen 12345 ;
    server_name 127.0.0.1;
    index index.php index.html index.htm default.php default.htm default.html;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    access_log /www/sites/12345/log/access.log main;
    error_log /www/sites/12345/log/error.log;
    location ^~ /.well-known/acme-challenge {
        allow all;
        root /usr/share/nginx/html;
    }
    root /www/sites/12345/index;
    # 新增代码 start
    # 解决刷新页面404问题
    try_files $uri $uri/ /index.html;
    # 接口代理，用于解决跨域问题
    location /api {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 后台接口地址，端口号根据自己搭建的javlib-server修改
        proxy_pass http://127.0.0.1:15175/api;

        proxy_redirect default;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Headers X-Requested-With;
        add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
    }
    # 新增代码 end
    error_page 404 /404.html;
}

```

## Project Setup

### Install

```bash
$ pnpm i
```

### Development

```bash
$ pnpm dev
```

### Build

```bash
$ pnpm build
```
