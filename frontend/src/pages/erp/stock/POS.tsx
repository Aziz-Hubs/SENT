import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";

export default function POSPage() {
    return (
        <div className="h-[calc(100vh-4rem)] flex gap-4">
            {/* Product Grid */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search products..." className="pl-8" />
                    </div>
                    <Button variant="outline">Filter</Button>
                </div>

                <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                    {/* Placeholder Items */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="cursor-pointer hover:border-primary transition-colors">
                            <CardContent className="p-4 flex flex-col items-center gap-2">
                                <div className="w-full aspect-square bg-muted rounded-md" />
                                <span className="font-medium">Product {i}</span>
                                <span className="text-sm text-muted-foreground">$19.99</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout Sidebar */}
            <div className="w-[350px] flex flex-col gap-4 border-l pl-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Current Order
                    </h3>
                    <Button variant="ghost" size="sm" className="text-destructive h-8">Clear</Button>
                </div>

                <div className="flex-1 border rounded-md bg-muted/10 p-4 flex items-center justify-center text-muted-foreground">
                    Cart is empty
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>$0.00</span>
                    </div>
                    <Button className="w-full" size="lg">Checkout</Button>
                </div>
            </div>
        </div>
    );
}
