export interface Event {
  id: string
  date: string // YYYY-MM-DD
  types: string[]
  name: string
  location: string
  city: string
  color: string // HEX color
}

export interface Tags {
  types: Record<string, string> // type name -> color
  locations: string[]
  cities: string[]
}

export interface Settings {
  font: string
  version: string
}

export interface FormData {
  types: string[]
  name: string
  location: string
  city: string
  color: string
}