import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ReorderPaneProps {
  products: any[];
}

export function ReorderPane({ products }: ReorderPaneProps) {
  // Filter logic: Quantity <= MinStock OR Quantity <= 5 (default safety fallback)
  const lowStockItems = products.filter((p) => p.quantity <= (p.minStock || 5));

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" /> Reorder Planner
        </CardTitle>
        <CardDescription>
          Items below minimum stock levels requiring immediate procurement.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Min Level</TableHead>
              <TableHead className="text-right">Deficit</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  All stock levels are healthy.
                </TableCell>
              </TableRow>
            ) : (
              lowStockItems.map((p) => {
                const min = p.minStock || 5;
                const deficit = min - p.quantity;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right font-bold">
                      {p.quantity}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {min}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-bold">
                      -{deficit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="destructive"
                        className="uppercase text-[10px]"
                      >
                        Critical
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
