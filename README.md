
## 关于重新生成数据库SQL
```
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > migrations/0001_create_table_all.sql
```

## 导入SQL文件
```
npx wrangler d1 execute cfd1-firadio-wnam --remote --file migrations/0002_init_record.sql
```

## 关于更新数据库 migrations

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
