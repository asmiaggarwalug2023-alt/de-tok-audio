import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const feedback=sqliteTable('feedback',{
 id:text('id').primaryKey(),message:text('message').notNull(),category:text('category').notNull(),createdAt:integer('created_at').notNull(),read:integer('read').notNull().default(0)
});
