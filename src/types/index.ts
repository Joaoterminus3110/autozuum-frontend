// src/types/index.ts

export interface IUser {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string | Date;
}

// Já vamos deixar as outras interfaces prontas para o seu 10
export interface IVehicle {
  id?: string;
  brand: string;
  model: string;
  engine?: string;
  transmission?: string;
  manufactureYear?: number | string;
  modelYear?: number | string;
  price: number;
  mileage?: number;
  location?: string;
  description?: string;
  features?: string[];
  userId?: string;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  images?: { id?: string; url: string }[];
  user?: { name: string; email?: string }; // Dados do vendedor (útil para Perfil e Detalhes)
  Buyer?: { name: string }; // Dados do comprador
}

export interface IProposal {
  id?: string;
  targetVehicleId: string;
  cashOffer: number | string;
  offeredVehicleId?: string;
  status?: string;
  message?: string;
  buyerId?: string; // Adicionado para o select de venda
  buyer?: { name: string; email?: string }; // Dados do comprador que fez a proposta
  targetVehicle?: IVehicle; // Útil para listar as propostas no ProfilePage
}

export interface IReview {
  id?: string;
  reviewerId?: string;
  reviewedId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  reviewer?: { name: string }; // Útil para exibir quem avaliou na tela de perfil
}

export interface IVehicleImage {
  id?: string;
  url: string;
  vehicleId?: string;
}
