import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:Neymar@1001@db.jtprbqyiirnhvjkbsxnn.supabase.co:5432/postgres",
  },
});
