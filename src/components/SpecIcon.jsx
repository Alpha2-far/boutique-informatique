import {
  Cpu,
  Zap,
  HardDrive,
  Monitor,
  Battery,
  Keyboard,
  Cable,
  Layers,
  Wifi,
  Check,
  Laptop,
  Tv,
  Headphones,
  Smartphone,
  ShieldCheck,
  Disc
} from 'lucide-react';

const ICON_MAP = {
  cpu: Cpu,
  zap: Zap,
  harddrive: HardDrive,
  monitor: Monitor,
  battery: Battery,
  keyboard: Keyboard,
  cable: Cable,
  layers: Layers,
  wifi: Wifi,
  check: Check,
  laptop: Laptop,
  tv: Tv,
  headphones: Headphones,
  smartphone: Smartphone,
  shieldcheck: ShieldCheck,
  disc: Disc,
};

export function getSpecIconComponent(iconNameOrLibelle) {
  if (!iconNameOrLibelle) return Check;
  const key = String(iconNameOrLibelle).toLowerCase().trim();

  // Correspondance directe par nom d'icône
  if (ICON_MAP[key]) return ICON_MAP[key];

  // Correspondance par mot-clé dans le libellé
  if (key.includes('processeur') || key.includes('cpu')) return Cpu;
  if (key.includes('ram') || key.includes('mémoire') || key.includes('memoire')) return Zap;
  if (key.includes('stockage') || key.includes('ssd') || key.includes('disque') || key.includes('hdd') || key.includes('rom')) return HardDrive;
  if (key.includes('écran') || key.includes('ecran') || key.includes('dalle') || key.includes('display')) return Monitor;
  if (key.includes('batterie') || key.includes('autonomie')) return Battery;
  if (key.includes('clavier') || key.includes('format') || key.includes('pavé')) return Keyboard;
  if (key.includes('port') || key.includes('hdmi') || key.includes('usb') || key.includes('connectique')) return Cable;
  if (key.includes('graphique') || key.includes('carte') || key.includes('gpu')) return Layers;
  if (key.includes('wifi') || key.includes('bluetooth') || key.includes('réseau')) return Wifi;

  return Check;
}

export default function SpecIcon({ iconName, libelle, size = 18, className = '' }) {
  const IconComponent = getSpecIconComponent(iconName || libelle);
  return <IconComponent size={size} className={className} />;
}
