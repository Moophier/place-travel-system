import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      isCreator: boolean
      creatorApproved: boolean
      subscriptionActive: boolean
    }
  }

  interface User {
    role?: string
    isCreator?: boolean
    creatorApproved?: boolean
    subscriptionActive?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    isCreator?: boolean
    creatorApproved?: boolean
    subscriptionActive?: boolean
  }
}
