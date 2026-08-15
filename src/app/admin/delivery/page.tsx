"use client";

import { useEffect, useState } from "react";
import { MdCheck, MdClose } from "react-icons/md";

interface DeliverySlot { id: number; label: string; startTime: string; endTime: string; maxOrders: number; active: boolean; }
interface DeliverySchedule { id: number; orderId: number; customerId: number; slotId: number; date: string; address: string; pincode: string; contactPhone: string; status: string; driverName: string | null; driverPhone: string | null; deliveredAt: string | null; notes: string | null; }

const STATUS_COLORS: Record<string, string> = { scheduled: "bg-blue-500/10 text-blue-400", dispatched: "bg-yellow-500/10 text-yellow-400", delivered: "bg-green-500/10 text-green-400", cancelled: "bg-gray-500/10 text-gray-400" };

export default function DeliveryPage() {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"schedule" | "slots">("schedule");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ label: "", startTime: "", endTime: "", maxOrders: "5" });
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ orderId: "", customerId: "", slotId: "", date: "", address: "", pincode: "", contactPhone: "", notes: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/delivery/slots").then(r => r.json()),
      fetch("/api/admin/delivery/schedule").then(r => r.json()),
    ]).then(([slotsData, schedulesData]) => {
      setSlots(slotsData.slots || []);
      setSchedules(schedulesData.schedules || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreateSlot = async () => {
    if (!slotForm.label || !slotForm.startTime || !slotForm.endTime) return;
    const res = await fetch("/api/admin/delivery/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...slotForm, maxOrders: parseInt(slotForm.maxOrders) }) });
    if (res.ok) { const data = await res.json(); setSlots(prev => [...prev, data.slot]); setShowSlotForm(false); setSlotForm({ label: "", startTime: "", endTime: "", maxOrders: "5" }); }
  };

  const handleDeleteSlot = async (id: number) => {
    await fetch(`/api/admin/delivery/slots?id=${id}`, { method: "DELETE" });
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleAssign = async () => {
    if (!assignForm.orderId || !assignForm.customerId || !assignForm.slotId || !assignForm.date || !assignForm.address || !assignForm.pincode || !assignForm.contactPhone) return;
    const res = await fetch("/api/admin/delivery/schedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(assignForm) });
    if (res.ok) { const data = await res.json(); setSchedules(prev => [data.schedule, ...prev]); setShowAssign(false); setAssignForm({ orderId: "", customerId: "", slotId: "", date: "", address: "", pincode: "", contactPhone: "", notes: "" }); }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch("/api/admin/delivery/schedule", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status, deliveredAt: status === "delivered" ? new Date().toISOString() : s.deliveredAt } : s));
  };

  const filtered = statusFilter === "all" ? schedules : schedules.filter(s => s.status === statusFilter);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Delivery Management</h2>
        <button onClick={() => tab === "slots" ? setShowSlotForm(true) : setShowAssign(true)} className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">{tab === "slots" ? "+ Add Slot" : "+ Assign Delivery"}</button>
      </div>
      <div className="flex gap-2">
        {(["schedule", "slots"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${tab === t ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{t === "schedule" ? "Delivery Schedule" : "Time Slots"}</button>
        ))}
      </div>

      {tab === "slots" && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
          {slots.length === 0 ? <div className="p-8 text-center text-gray-500">No time slots configured</div> : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Label</th><th className="px-4 py-3 font-medium">Time</th><th className="px-4 py-3 font-medium">Max Orders</th><th className="px-4 py-3 font-medium">Active</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-800">
                {slots.map(s => (
                  <tr key={s.id} className="text-gray-300">
                    <td className="px-4 py-3 font-medium">{s.label}</td>
                    <td className="px-4 py-3">{s.startTime} - {s.endTime}</td>
                    <td className="px-4 py-3">{s.maxOrders}</td>
                    <td className="px-4 py-3">{s.active ? <span className="text-green-400"><MdCheck /></span> : <span className="text-gray-500"><MdClose /></span>}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDeleteSlot(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "schedule" && (
        <>
          <div className="flex gap-2">
            {["all", "scheduled", "dispatched", "delivered", "cancelled"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{s}</button>
            ))}
          </div>
          <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            {filtered.length === 0 ? <div className="p-8 text-center text-gray-500">No deliveries scheduled</div> : (
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-gray-800 text-gray-400"><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Address</th><th className="px-4 py-3 font-medium">Pincode</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(s => (
                    <tr key={s.id} className="text-gray-300">
                      <td className="px-4 py-3">#{s.orderId}</td>
                      <td className="px-4 py-3">{new Date(s.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{s.address}</td>
                      <td className="px-4 py-3">{s.pincode}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[s.status] || STATUS_COLORS.scheduled}`}>{s.status}</span></td>
                      <td className="px-4 py-3 flex gap-2">
                        {s.status === "scheduled" && <button onClick={() => handleStatusUpdate(s.id, "dispatched")} className="text-xs text-yellow-400 hover:text-yellow-300">Dispatch</button>}
                        {s.status === "dispatched" && <button onClick={() => handleStatusUpdate(s.id, "delivered")} className="text-xs text-green-400 hover:text-green-300">Delivered</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showSlotForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">Add Delivery Slot</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-300 mb-1">Label</label><input type="text" value={slotForm.label} onChange={e => setSlotForm({...slotForm, label: e.target.value})} placeholder="e.g. Morning Slot" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-300 mb-1">Start Time</label><input type="time" value={slotForm.startTime} onChange={e => setSlotForm({...slotForm, startTime: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">End Time</label><input type="time" value={slotForm.endTime} onChange={e => setSlotForm({...slotForm, endTime: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              </div>
              <div><label className="block text-sm text-gray-300 mb-1">Max Orders</label><input type="number" value={slotForm.maxOrders} onChange={e => setSlotForm({...slotForm, maxOrders: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSlotForm(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
                <button onClick={handleCreateSlot} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">Assign Delivery</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-300 mb-1">Order ID *</label><input type="number" value={assignForm.orderId} onChange={e => setAssignForm({...assignForm, orderId: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Customer ID *</label><input type="number" value={assignForm.customerId} onChange={e => setAssignForm({...assignForm, customerId: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              </div>
              <div><label className="block text-sm text-gray-300 mb-1">Slot *</label><select value={assignForm.slotId} onChange={e => setAssignForm({...assignForm, slotId: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500"><option value="">Select slot</option>{slots.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.label} ({s.startTime}-{s.endTime})</option>)}</select></div>
              <div><label className="block text-sm text-gray-300 mb-1">Date *</label><input type="date" value={assignForm.date} onChange={e => setAssignForm({...assignForm, date: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm text-gray-300 mb-1">Address *</label><input type="text" value={assignForm.address} onChange={e => setAssignForm({...assignForm, address: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-gray-300 mb-1">Pincode *</label><input type="text" value={assignForm.pincode} onChange={e => setAssignForm({...assignForm, pincode: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
                <div><label className="block text-sm text-gray-300 mb-1">Phone *</label><input type="text" value={assignForm.contactPhone} onChange={e => setAssignForm({...assignForm, contactPhone: e.target.value})} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm outline-none focus:border-primary-500" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAssign(false)} className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700">Cancel</button>
                <button onClick={handleAssign} className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
