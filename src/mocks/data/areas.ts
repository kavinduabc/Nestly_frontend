import type { Area } from '@/types'

function generatePriceHistory(basePrice: number, trend: 'rising' | 'stable' | 'falling') {
  const months = ['Nov 23', 'Dec 23', 'Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24']
  return months.map((month, i) => {
    let multiplier = 1
    if (trend === 'rising') multiplier = 1 + i * 0.015
    else if (trend === 'falling') multiplier = 1 - i * 0.008
    else multiplier = 1 + (Math.random() - 0.5) * 0.02
    return {
      month,
      avgPrice: Math.round(basePrice * multiplier),
      listingCount: Math.floor(Math.random() * 20) + 5,
    }
  })
}

export const mockAreas: Area[] = [
  {
    id: 'area-colombo',
    name: 'Colombo',
    lat: 6.9271,
    lng: 79.8612,
    avgPricePerPerch: 2500000,
    listingCount: 24,
    trend: 'rising',
    priceHistory: generatePriceHistory(2500000, 'rising'),
  },
  {
    id: 'area-negombo',
    name: 'Negombo',
    lat: 7.2081,
    lng: 79.8359,
    avgPricePerPerch: 650000,
    listingCount: 18,
    trend: 'rising',
    priceHistory: generatePriceHistory(650000, 'rising'),
  },
  {
    id: 'area-gampaha',
    name: 'Gampaha',
    lat: 7.0895,
    lng: 80.0162,
    avgPricePerPerch: 450000,
    listingCount: 15,
    trend: 'stable',
    priceHistory: generatePriceHistory(450000, 'stable'),
  },
  {
    id: 'area-kandy',
    name: 'Kandy',
    lat: 7.2905,
    lng: 80.6337,
    avgPricePerPerch: 380000,
    listingCount: 12,
    trend: 'rising',
    priceHistory: generatePriceHistory(380000, 'rising'),
  },
  {
    id: 'area-galle',
    name: 'Galle',
    lat: 6.0329,
    lng: 80.2168,
    avgPricePerPerch: 720000,
    listingCount: 10,
    trend: 'rising',
    priceHistory: generatePriceHistory(720000, 'rising'),
  },
  {
    id: 'area-kurunegala',
    name: 'Kurunegala',
    lat: 7.4818,
    lng: 80.3609,
    avgPricePerPerch: 180000,
    listingCount: 8,
    trend: 'stable',
    priceHistory: generatePriceHistory(180000, 'stable'),
  },
  {
    id: 'area-matara',
    name: 'Matara',
    lat: 5.9465,
    lng: 80.5361,
    avgPricePerPerch: 320000,
    listingCount: 7,
    trend: 'rising',
    priceHistory: generatePriceHistory(320000, 'rising'),
  },
  {
    id: 'area-jaffna',
    name: 'Jaffna',
    lat: 9.6615,
    lng: 80.0255,
    avgPricePerPerch: 220000,
    listingCount: 6,
    trend: 'rising',
    priceHistory: generatePriceHistory(220000, 'rising'),
  },
]

export const sriLankaTowns = [
  'Colombo', 'Negombo', 'Gampaha', 'Kandy', 'Galle', 'Kurunegala', 'Matara', 'Jaffna',
  'Kalutara', 'Ratnapura', 'Badulla', 'Anuradhapura', 'Polonnaruwa', 'Trincomalee',
  'Batticaloa', 'Ampara', 'Hambantota', 'Nuwara Eliya', 'Kegalle', 'Monaragala',
  'Vavuniya', 'Mannar', 'Mullaitivu', 'Kilinochchi', 'Puttalam',
]
