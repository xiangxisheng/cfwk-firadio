## 关于更新数据库 migrations

### 1、首先编辑[schema.prisma]文件，添加或修改相应的表结构

### 2、然后生成migrations
```
npx prisma migrate dev
```

### 3、创建远程迁移脚本
```
npx wrangler d1 migrations create cfd1-firadio-wnam cfd1-firadio-wnam
```

### 4、编辑生成的脚本
手动将[prisma/migrations]下面生成的SQL贴到[migrations]下面生成的SQL

### 5、应用远程迁移脚本
```
npx wrangler d1 migrations apply cfd1-firadio-wnam --remote
```
