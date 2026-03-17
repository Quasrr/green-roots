-- DropForeignKey
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_orderId_fkey";

-- DropForeignKey
ALTER TABLE "TreeCategory" DROP CONSTRAINT "TreeCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TreeCategory" DROP CONSTRAINT "TreeCategory_treeId_fkey";

-- AddForeignKey
ALTER TABLE "TreeCategory" ADD CONSTRAINT "TreeCategory_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreeCategory" ADD CONSTRAINT "TreeCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
