import {
  Cpu,
  Gamepad2,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  MousePointer2,
  Monitor,
  Box,
  Headphones,
  Wifi,
} from "lucide-react";

export const DEPARTMENTS = [
  { name: "Processadores", icon: Cpu, slug: "processadores" },
  { name: "Placas de Vídeo", icon: Gamepad2, slug: "placa-de-video" },
  { name: "Placas-mãe", icon: CircuitBoard, slug: "placas-mae" },
  { name: "Memória RAM", icon: MemoryStick, slug: "memoria-ram" },
  { name: "Armazenamento", icon: HardDrive, slug: "ssd-hd" },
  { name: "Periféricos", icon: MousePointer2, slug: "acessorios" },
  { name: "Monitores", icon: Monitor, slug: "monitores" },
  { name: "Gabinetes", icon: Box, slug: "gabinetes" },
  { name: "Áudio", icon: Headphones, slug: "headset" },
  { name: "Redes", icon: Wifi, slug: "rede" },
];
