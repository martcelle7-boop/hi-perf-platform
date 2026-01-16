'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { boProductsApi } from '@/lib/api/bo-products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [newPriceNetworkId, setNewPriceNetworkId] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const [allNetworks, setAllNetworks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const productData = await boProductsApi.getById(productId);
        setProduct(productData);
        setFormData({
          name: productData.name,
          code: productData.code,
          description: productData.description || '',
          type: productData.type,
          brand: productData.brand || '',
          publicPrice: productData.publicPrice || '',
          isActive: productData.isActive,
        });
        setNetworks(productData.productNetworks || []);
        setPrices(productData.productPrices || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await boProductsApi.update(productId, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        brand: formData.brand,
        publicPrice: formData.publicPrice || undefined,
        isActive: formData.isActive,
      });
      toast.success('Product updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  const handleAddPrice = async () => {
    if (!newPriceNetworkId || !newPriceAmount) return;
    try {
      await boProductsApi.createPrice(productId, { networkId: parseInt(newPriceNetworkId), amount: newPriceAmount });
      toast.success('Price created');
      const updatedPrices = await boProductsApi.getPrices(productId);
      setPrices(updatedPrices);
      setNewPriceNetworkId('');
      setNewPriceAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create price');
    }
  };

  const handleDeletePrice = async (priceId: number) => {
    try {
      await boProductsApi.deletePrice(priceId);
      toast.success('Price deleted');
      setPrices(prices.filter((p) => p.id !== priceId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete price');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product: {product?.name}</h1>
        <Link href="/bo/products">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {product && (
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="networks">Networks ({networks.length})</TabsTrigger>
            <TabsTrigger value="prices">Pricing ({prices.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="border rounded-lg p-6">
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="PARTNER">Partner</SelectItem>
                      <SelectItem value="GENERIC">Generic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="publicPrice">Public Price (HT)</Label>
                  <Input
                    id="publicPrice"
                    type="number"
                    step="0.01"
                    value={formData.publicPrice}
                    onChange={(e) => setFormData({ ...formData, publicPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </Label>
              </div>

              <Button type="submit">Update Product</Button>
            </form>
          </TabsContent>

          {/* Networks Tab */}
          <TabsContent value="networks" className="border rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-4">Manage product visibility per network</p>
            {networks.length === 0 ? (
              <p className="text-gray-500">No networks assigned</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((pn) => (
                    <TableRow key={pn.id}>
                      <TableCell>{pn.network.name}</TableCell>
                      <TableCell>{pn.network.code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="prices" className="border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-4">Set prices per network (for NORMAL products only)</p>
              {product.type === 'NORMAL' ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-4 bg-blue-50">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="networkId">Network</Label>
                        <Select value={newPriceNetworkId} onValueChange={setNewPriceNetworkId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Network list would go here */}
                            <SelectItem value="1">Network 1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Price</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={newPriceAmount}
                          onChange={(e) => setNewPriceAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddPrice} type="button">
                          Add Price
                        </Button>
                      </div>
                    </div>
                  </div>

                  {prices.length === 0 ? (
                    <p className="text-gray-500">No prices set</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Network</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prices.map((price) => (
                          <TableRow key={price.id}>
                            <TableCell>{price.network?.name || 'N/A'}</TableCell>
                            <TableCell>{price.amount}</TableCell>
                            <TableCell>{price.currency}</TableCell>
                            <TableCell>{price.isActive ? '✅' : '⏸'}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePrice(price.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ) : (
                <p className="text-amber-600 bg-amber-50 p-3 rounded">
                  Pricing is only available for NORMAL products. This is a {product.type} product.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
