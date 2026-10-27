# 部署到服务器 + 域名

这是把「星屿手记」长期挂在公网上的步骤。部署完成后，域名会通过 Caddy 自动申请 HTTPS 证书，数据保存在服务器的 `data/` 目录。

> GitHub Release 只是源码版本，不会让网站自动上线；这个项目需要一台一直开着的服务器。

## 你需要准备

- 一台 Ubuntu 22.04 / 24.04 的 VPS，建议 **2GB 内存** 起
- 一个域名（例如 `your-domain.com`）
- 服务器公网 IP
- 域名 DNS 管理权限

如果服务器在中国大陆，域名通常需要 ICP 备案；想省掉备案，可以选择香港 / 新加坡等境外服务器。

## 1. 解析域名

在域名 DNS 后台添加：

```text
类型    主机记录    值
A       @           你的服务器公网 IP
```

如果使用 Cloudflare，第一次申请证书时先把小云朵设为 **DNS only（灰色）**；证书签发后再决定是否开代理。

## 2. 安装 Docker

SSH 登录服务器后执行：

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

退出 SSH 再重新登录，让 Docker 权限生效，然后确认：

```bash
docker compose version
```

## 3. 拉取代码

```bash
sudo mkdir -p /opt/xingyu-blog
sudo chown $USER:$USER /opt/xingyu-blog
git clone https://github.com/fenghuangchen/xingyu-blog.git /opt/xingyu-blog
cd /opt/xingyu-blog
```

## 4. 配置环境变量

```bash
cp .env.production.example .env
nano .env
```

把 `DOMAIN` 改成你的域名，例如：

```env
DOMAIN=your-domain.com
OWNER_HANDLE=qicha
```

保存后退出。

## 5. 迁移现有数据（重要）

如果要把本机现在的笔记、账号、留言和头像带到服务器，需要复制 `data/` 目录。**先停止本机正在运行的服务**，避免 SQLite WAL 文件不一致。

在本机项目目录执行（把 `user` 和 `SERVER_IP` 换成你的服务器信息）：

```powershell
scp -r .\data\* user@SERVER_IP:/opt/xingyu-blog/data/
```

如果服务器上还没有 `data` 目录，先创建：

```bash
mkdir -p /opt/xingyu-blog/data
```

需要包含：

- `data/xingyu.db`
- `data/xingyu.db-wal`（如果存在）
- `data/xingyu.db-shm`（如果存在）
- `data/uploads/`

如果只想全新开始，可以跳过这一步；首次启动会导入示例数据，演示账号是 `qicha` / `xingyu2026`，登录后请立刻改密码。

## 6. 启动

```bash
cd /opt/xingyu-blog
docker compose up -d --build
docker compose logs -f caddy
```

第一次构建需要几分钟。看到 Caddy 成功获取证书后，按 `Ctrl+C` 退出日志查看。

如果服务器开了防火墙，需要放行：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

云服务商的安全组也要放行 80 / 443。

## 7. 验证

打开：

```text
https://your-domain.com
```

检查：

- 首页能打开
- 登录 `祁茶` / 你的密码
- 笔记、图片、留言都在
- `/studio` 能进入
- 注册一个新账号，能得到 `/u/用户名` 小站

## 8. 以后更新

服务器上拉取最新代码并重建：

```bash
cd /opt/xingyu-blog
git pull
docker compose up -d --build
```

只改笔记、动态、主题、头像不需要这一步，直接在网站 `/studio` 里改即可。

## 9. 备份

```bash
cd /opt/xingyu-blog
docker compose stop app
tar czf ~/xingyu-backup-$(date +%F).tar.gz data
docker compose start app
```

把备份文件下载到本机保存。`data/` 里包含数据库和上传图片，不能只备份代码。

## 常见问题

**Caddy 一直申请证书失败**

- 域名 A 记录是否已经指向服务器 IP
- 80 / 443 是否放行
- Cloudflare 是否还开着橙色云朵（先改 DNS only）
- 域名是否已经备案（大陆服务器）

**页面 502**

```bash
docker compose ps
docker compose logs app
docker compose logs caddy
```

**忘了密码**

打开 `https://你的域名/forgot`，用密保问题找回。

**想换域名**

改 `.env` 里的 `DOMAIN`，然后：

```bash
docker compose up -d
```

Caddy 会自动重新申请证书。
