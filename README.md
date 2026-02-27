# Brisa Consciente — Booking Agenda (Nuxt 3)

Online booking flow for **Brisa Consciente** (therapeutic center).  
Built with **Nuxt 3 + TailwindCSS** and a **PostgreSQL** backend (Railway).  
Users can book **1 session** or a **package (e.g., 4 sessions)** with a selected professional.

## Features

- Multi-step booking flow (Stepper)
  - Identification (name + email)
  - Choose professional
  - Choose package (1 or pack)
  - Select required number of time slots
  - Summary / confirmation
- Availability listing from the backend (`/api/slots`)
- Professionals and pricing from the backend (`/api/professionals`)
- Designed for online appointments (v1)

## Tech Stack

- Nuxt 3
- Vue 3 (Composition API)
- TailwindCSS
- PostgreSQL (Railway)
- Node `pg` driver (SQL-first approach, no ORM)

## Project Setup

### Requirements
- Node.js (recommended: 18+)
- npm / pnpm / yarn
- PostgreSQL database (Railway)