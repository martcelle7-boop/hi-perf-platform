'use client';

import { useEffect, useState } from 'react';
import { useAdminClients } from '@/hooks/useAdminClients';
import { adminClientsApi } from '@/lib/api/admin-clients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
import Link from 'next/link';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = parseInt(params.id);
  const { updateClient } = useAdminClients();
  const [client, setClient] = useState<any>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [allNetworks, setAllNetworks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const clientData = await adminClientsApi.getById(clientId);
        setClient(clientData);
        setName(clientData.name);
        setNetworks(clientData.clientNetworks || []);

        // Get all networks
        const resp = await adminClientsApi.getNetworks(clientId);
        setAllNetworks(Array.isArray(resp) ? resp : []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load client');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateClient(clientId, name);
    if (result) {
      setClient({ ...client, name });
    }
  };

  const handleAddNetwork = async () => {
    if (!networkId) return;
    try {
      await adminClientsApi.assignNetwork(clientId, parseInt(networkId));
      toast.success('Network assigned');
      const updated = await adminClientsApi.getNetworks(clientId);
      setAllNetworks(Array.isArray(updated) ? updated : []);
      setNetworkId('');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign network');
    }
  };

  const handleRemoveNetwork = async (networkId: number) => {
    try {
      await adminClientsApi.removeNetwork(clientId, networkId);
      toast.success('Network removed');
      setAllNetworks(allNetworks.filter((n) => n.networkId !== networkId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove network');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Details</h1>
        <Link href="/admin/clients">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {client && (
        <div className="grid gap-6">
          {/* Client Info */}
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Information</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button type="submit">Update</Button>
            </form>
          </div>

          {/* Assigned Networks */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Assigned Networks</h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>Assign Network</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Network</DialogTitle>
                  </DialogHeader>
                  {/* Network selection would go here */}
                  <p className="text-sm text-gray-500 mb-4">
                    Network assignment form coming soon
                  </p>
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogContent>
              </Dialog>
            </div>

            {allNetworks.length === 0 ? (
              <p className="text-gray-500">No networks assigned</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allNetworks.map((cn) => (
                    <TableRow key={cn.id}>
                      <TableCell>{cn.network.name}</TableCell>
                      <TableCell>{cn.network.code}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveNetwork(cn.networkId)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
