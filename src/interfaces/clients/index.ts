export interface IClients {
  success: boolean
  clients: IClient[]
}

export interface IClient {
  id: number
  client_name: string
  client_slug: string
  client_description: null | string
}
