import { describe, expect, it } from 'vitest'

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
  configurable: true,
})

describe('normalizePropertyPayload', () => {
  it('fills in all supported property form fields before submit', async () => {
    const { normalizePropertyPayload } = await import('./index')

    const payload = normalizePropertyPayload({
      vendor: 'vendor-1',
      name: 'Test property',
      description: 'A sample property',
      country: 'country-1',
      city: 'city-1',
      location: 'location-1',
      address: '123 Main St',
      latitude: 1.23,
      longitude: 4.56,
      feature_image: 'feature.png',
      listing_price: 100,
      sale_price: 150,
      is_featured: true,
    } as any)

    expect(payload.vendor).toBe('vendor-1')
    expect(payload.gallery_images).toEqual([])
    expect(payload.food_options).toEqual([])
    expect(payload.amenities).toEqual([])
    expect(payload.facilities).toEqual([])
    expect(payload.rooms).toEqual([])
    expect(payload.trade_license).toBe('')
    expect(payload.trade_license_number).toBe('')
    expect(payload.star_rating).toBe('')
    expect(payload.tax_name).toBe('')
    expect(payload.tax_percentage).toBe(0)
    expect(payload.check_in_time).toBe('')
    expect(payload.checkout_time).toBe('')
  })
})
