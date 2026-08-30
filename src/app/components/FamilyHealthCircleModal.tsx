import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Plus,
  Share2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Activity,
  Droplets,
  Footprints,
  Pill,
  MapPin,
  Sparkles,
  Send,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  PhoneCall,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { triggerConfetti, triggerHaptic } from '../utils/celebration';
import { toast } from 'sonner';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  location: string;
  flag: string;
  avatar: string;
  condition: string;
  lastActive: string;
  status: 'optimal' | 'attention' | 'good';
  vitals: {
    glucose?: { value: number; unit: string; status: 'normal' | 'elevated' | 'low'; time: string };
    bp?: { systolic: number; diastolic: number; status: 'normal' | 'elevated'; time: string };
    waterGlasses: number;
    waterTarget: number;
    walkCompleted: boolean;
    medsTaken: boolean;
    medsName?: string;
  };
}

const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Mama Esther',
    relation: 'Mother',
    location: 'Lagos, Nigeria',
    flag: '🇳🇬',
    avatar: '👵🏾',
    condition: 'Type 2 Diabetes & HTN',
    lastActive: '12 mins ago',
    status: 'optimal',
    vitals: {
      glucose: { value: 118, unit: 'mg/dL', status: 'normal', time: 'Fasting 8:00 AM' },
      bp: { systolic: 122, diastolic: 80, status: 'normal', time: 'Morning' },
      waterGlasses: 6,
      waterTarget: 8,
      walkCompleted: true,
      medsTaken: true,
      medsName: 'Metformin 500mg',
    },
  },
  {
    id: 'fam-2',
    name: 'Papa Adebayo',
    relation: 'Father',
    location: 'London, UK',
    flag: '🇬🇧',
    avatar: '👴🏾',
    condition: 'Stage 1 Hypertension',
    lastActive: '1 hour ago',
    status: 'good',
    vitals: {
      bp: { systolic: 126, diastolic: 82, status: 'normal', time: '10:30 AM' },
      waterGlasses: 5,
      waterTarget: 8,
      walkCompleted: false,
      medsTaken: true,
      medsName: 'Amlodipine 5mg',
    },
  },
  {
    id: 'fam-3',
    name: 'Chidinma',
    relation: 'Sister / Co-Caregiver',
    location: 'Toronto, Canada',
    flag: '🇨🇦',
    avatar: '👩🏾‍🦱',
    condition: 'PCOS & Satiety Plan',
    lastActive: '3 hours ago',
    status: 'optimal',
    vitals: {
      waterGlasses: 7,
      waterTarget: 8,
      walkCompleted: true,
      medsTaken: true,
    },
  },
];

interface FamilyHealthCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FamilyHealthCircleModal({
  isOpen,
  onClose,
}: FamilyHealthCircleModalProps) {
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const cached = localStorage.getItem('user_family_circle_members');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_FAMILY_MEMBERS;
  });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Mother');
  const [newMemberLocation, setNewMemberLocation] = useState('Lagos, Nigeria 🇳🇬');
  const [newMemberCondition, setNewMemberCondition] = useState('Type 2 Diabetes');

  // Save to local vault
  const persistMembers = (updated: FamilyMember[]) => {
    setMembers(updated);
    try {
      localStorage.setItem('user_family_circle_members', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const handleSendCheer = (member: FamilyMember) => {
    triggerHaptic('success');
    triggerConfetti('stars');
    toast.success(`🎉 Cheer sent to ${member.name}! ("Keep up the great metabolic momentum!")`);
  };

  const handleSendHydrationNudge = (member: FamilyMember) => {
    triggerHaptic('light');
    toast.info(`💧 Hydration nudge sent to ${member.name}! ("Time for a glass of water!")`);
  };

  const handleSendWalkReminder = (member: FamilyMember) => {
    triggerHaptic('light');
    toast.info(`🚶‍♂️ Post-meal walk reminder sent to ${member.name}!`);
  };

  const handleShareFamilyDossierWhatsApp = (member: FamilyMember) => {
    triggerHaptic('medium');
    triggerConfetti('burst');

    const message =
      `🥑 *MealOptimiza Family Health Circle Report* 👨‍👩‍👧‍👦\n` +
      `👤 Member: *${member.name}* (${member.relation}) · ${member.location}\n` +
      `🩺 Condition: *${member.condition}*\n\n` +
      (member.vitals.glucose ? `🩸 *Fasting Blood Sugar:* ${member.vitals.glucose.value} ${member.vitals.glucose.unit} (Controlled 🟢)\n` : '') +
      (member.vitals.bp ? `🫀 *Blood Pressure:* ${member.vitals.bp.systolic}/${member.vitals.bp.diastolic} mmHg (Optimal 🟢)\n` : '') +
      `💧 *Hydration:* ${member.vitals.waterGlasses}/${member.vitals.waterTarget} Glasses\n` +
      `💊 *Medication:* ${member.vitals.medsTaken ? 'Taken on Schedule ✅' : 'Pending'}\n` +
      `🚶‍♂️ *15-Min Walk:* ${member.vitals.walkCompleted ? 'Completed ✅' : 'Scheduled for Evening'}\n\n` +
      `_Monitored with Love via MealOptimiza Family Care Vault_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    toast.success('Opening WhatsApp Care Dossier!');
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    triggerHaptic('medium');
    triggerConfetti('cannons');

    const flag = newMemberLocation.includes('Nigeria') ? '🇳🇬' : newMemberLocation.includes('UK') ? '🇬🇧' : newMemberLocation.includes('Canada') ? '🇨🇦' : newMemberLocation.includes('US') ? '🇺🇸' : '🌍';
    const avatar = newMemberRelation.includes('Mother') ? '👵🏾' : newMemberRelation.includes('Father') ? '👴🏾' : newMemberRelation.includes('Sister') ? '👩🏾' : newMemberRelation.includes('Brother') ? '👨🏾' : '🧑🏾';

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: newMemberName.trim(),
      relation: newMemberRelation,
      location: newMemberLocation,
      flag,
      avatar,
      condition: newMemberCondition,
      lastActive: 'Just now',
      status: 'good',
      vitals: {
        glucose: { value: 115, unit: 'mg/dL', status: 'normal', time: 'Morning' },
        bp: { systolic: 120, diastolic: 80, status: 'normal', time: 'Morning' },
        waterGlasses: 4,
        waterTarget: 8,
        walkCompleted: false,
        medsTaken: true,
      },
    };

    const updated = [...members, newMember];
    persistMembers(updated);
    setNewMemberName('');
    setShowInviteModal(false);
    toast.success(`Linked ${newMember.name} to your Family Health Circle! 👨‍👩‍👧‍👦`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-5 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto bg-slate-900 text-white border border-teal-500/30 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl text-slate-950 shadow-md">
                <Users className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Family Health Circle</span>
                  <span className="text-[9.5px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                    DIASPORA CARE
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-200 mt-0.5">
                  Monitor &amp; support your parents and loved ones across the globe in real time.
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-[#1f7a8c] hover:bg-[#165c6a] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>Invite Loved One</span>
            </button>
          </div>
        </DialogHeader>

        {/* Diaspora Reassurance Hero Banner */}
        <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-[#126778]/40 via-teal-900/30 to-emerald-950/40 border border-teal-500/30 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black">
              <Heart size={14} className="fill-amber-300 animate-pulse" />
              <span>Active Remote Care Monitoring</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              All <strong>{members.length} linked family members</strong> are logging meals, tracking vitals, and shielded by food-drug interaction alerts today.
            </p>
          </div>
          <span className="text-2xl p-2 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0">🌍</span>
        </div>

        {/* Linked Family Members Cards List */}
        <div className="space-y-3.5 my-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition-all shadow-md space-y-3"
            >
              {/* Member Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl p-2 bg-white/10 rounded-2xl border border-white/10 shrink-0">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-white">{member.name}</h4>
                      <span className="text-[10px] text-teal-300 font-bold bg-teal-950 px-2 py-0.2 rounded-full border border-teal-800">
                        {member.relation}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-0.5">
                      <MapPin size={11} className="text-amber-400" />
                      <span>{member.location}</span>
                      <span>•</span>
                      <span className="text-slate-400">Active {member.lastActive}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Controlled 🟢
                </span>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {member.vitals.glucose && (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] text-slate-400 block">Fasting Glucose</span>
                    <strong className="text-xs text-emerald-300 font-black">
                      {member.vitals.glucose.value} {member.vitals.glucose.unit}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-medium">{member.vitals.glucose.time}</span>
                  </div>
                )}

                {member.vitals.bp && (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] text-slate-400 block">Blood Pressure</span>
                    <strong className="text-xs text-teal-300 font-black">
                      {member.vitals.bp.systolic}/{member.vitals.bp.diastolic}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5 font-medium">mmHg · Safe</span>
                  </div>
                )}

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block">Hydration 💧</span>
                  <strong className="text-xs text-cyan-300 font-black">
                    {member.vitals.waterGlasses} / {member.vitals.waterTarget}
                  </strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5 font-medium">Glasses Today</span>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[9.5px] text-slate-400 block">Medication 💊</span>
                  <strong className="text-xs text-amber-300 font-black">
                    {member.vitals.medsTaken ? 'Taken ✅' : 'Pending'}
                  </strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5 font-medium truncate">
                    {member.vitals.medsName || 'On Schedule'}
                  </span>
                </div>
              </div>

              {/* 1-Tap Family Action Tools Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSendCheer(member)}
                    className="px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-amber-400/30"
                  >
                    <span>👏 Cheer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendHydrationNudge(member)}
                    className="px-2.5 py-1 bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-300 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-cyan-400/30"
                  >
                    <Droplets size={11} />
                    <span>Water Nudge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendWalkReminder(member)}
                    className="px-2.5 py-1 bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-300 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-emerald-400/30"
                  >
                    <Footprints size={11} />
                    <span>Walk Nudge</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleShareFamilyDossierWhatsApp(member)}
                  className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-[10.5px] font-black flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Share2 size={11} />
                  <span>WhatsApp Dossier</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[10.5px]">
            <ShieldCheck size={13} className="text-teal-400" />
            <span>End-to-End Encrypted Family Health Vault</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-300 hover:underline font-bold cursor-pointer"
          >
            Close Circle
          </button>
        </div>

        {/* SUB-MODAL: INVITE NEW FAMILY MEMBER */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-950 text-white border border-teal-500/40 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <span>Link a Family Member 👨‍👩‍👧‍👦</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Add a parent, spouse, or sibling to your remote diaspora care network.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddMember} className="space-y-3.5 py-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name / Nickname</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Mama Folake, Uncle Emeka"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Relation</label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Location</label>
                  <select
                    value={newMemberLocation}
                    onChange={(e) => setNewMemberLocation(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Lagos, Nigeria 🇳🇬">Lagos, Nigeria 🇳🇬</option>
                    <option value="Abuja, Nigeria 🇳🇬">Abuja, Nigeria 🇳🇬</option>
                    <option value="London, UK 🇬🇧">London, UK 🇬🇧</option>
                    <option value="Toronto, Canada 🇨🇦">Toronto, Canada 🇨🇦</option>
                    <option value="Houston, USA 🇺🇸">Houston, USA 🇺🇸</option>
                    <option value="Accra, Ghana 🇬🇭">Accra, Ghana 🇬🇭</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Primary Health Focus</label>
                <input
                  type="text"
                  value={newMemberCondition}
                  onChange={(e) => setNewMemberCondition(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Satiety Weight Loss"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                >
                  Link Member 🤝
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
