# Cloudflare Worker


## 一、测试服务器运行方法
### 1：首先安装Node.js模块
```
npm install
```

### 2：复制SQLite依赖
```
mkdir build
copy /y node_modules\sqlite3\build\Release\node_sqlite3.node build\
```

### 3：导入表结构
```
npx prisma db push
npx prisma db push --schema=./prisma/avue.prisma
npx prisma db push --schema=./prisma/bee.prisma
npx prisma db push --schema=./prisma/bkdata.prisma
```

### 4：运行测试服务器
```
npm run serve
```

### 5：发布到生产服务器
#### 1：编辑wrangler.toml文件
将wrangler.toml.example复制到wrangler.toml，然后编辑环境变量和数据库绑定

#### 2：重新生成类型
```
npx wrangler types
```

#### 3:发布
```
npx wrangler deploy
```


## 二、数据库的部署

### 1：重新生成数据库SQL
```
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > migrations/0001_create_table_all.sql
```

### 2：导入SQL文件
```
npx wrangler d1 execute cfd1-firadio-wnam --remote --file migrations/0002_init_record.sql
```

## 三、更新数据库 migrations

### 1、首先编辑[schema.prisma]文件，添加或修改相应的表结构，然后生成[类文件]
```
npx prisma generate
```

### 2、将[schema.prisma]文件的[表结构]推到[dev数据库]
```
npx prisma db push
```

### 3、将[dev数据库]的[表结构]拉到[schema.prisma]文件
```
npx prisma db pull
```

### 4、通过浏览器查看[dev数据库]
```
npx prisma studio
```

### 5、生成[prisma]下面的[migrations]SQL文件
```
npx prisma migrate dev
```

### 6、创建远程迁移脚本(空白SQL),需要编辑好SQL后才能apply到生产数据库
```
npx wrangler d1 migrations create cfd1-firadio-wnam create_table_all
```

### 7、编辑生成的脚本
手动将[prisma/migrations]下面生成的SQL文件[migration.sql]贴到[migrations]下面生成的空SQL文件[0001_create_table_all.sql]

### 8、应用远程迁移脚本
```
npx wrangler d1 migrations apply cfd1-firadio-wnam --remote
```

