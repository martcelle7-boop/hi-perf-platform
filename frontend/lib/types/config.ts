export interface AppConfig {
  id: number;
  allowMultiNetworkCart: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConfigRequest {
  allowMultiNetworkCart: boolean;
}
