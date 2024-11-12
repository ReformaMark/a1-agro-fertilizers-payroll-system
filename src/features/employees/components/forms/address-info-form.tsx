"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { EmployeeFormValues } from "../../lib/schema"
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays, Region, Province, City, Barangay } from "@/lib/address-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { findPostalCodeByBarangay } from "@/lib/postal-codes"
import { toast } from "sonner"

interface AddressInfoFormProps {
  form: UseFormReturn<EmployeeFormValues>
}

export function AddressInfoForm({ form }: AddressInfoFormProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNCR, setIsNCR] = useState(false)

  useEffect(() => {
    fetchRegions().then(data => {
      setRegions(data)
      setIsLoading(false)
    })
  }, [])

  const handleRegionChange = async (regionCode: string) => {
    console.log('Region Changed:', regionCode)
    
    // Clear all dependent fields
    form.setValue('province', '')
    form.setValue('city', '')
    form.setValue('barangay', '')
    form.setValue('postalCode', '')
    setCities([])
    setBarangays([])
    
    // Update NCR check to match the full region code
    const isNCRSelected = regionCode === '130000000'
    setIsNCR(isNCRSelected)
    
    if (isNCRSelected) {
      form.setValue('province', 'Metro Manila')
      
      try {
        // Use the correct NCR province code
        const cityData = await fetchCities('130000000')
        setCities(cityData)
      } catch (error) {
        console.error('Error fetching NCR cities:', error)
      }
    } else {
      const provinceData = await fetchProvinces(regionCode)
      setProvinces(provinceData)
    }
  }

  const handleProvinceChange = async (provinceCode: string) => {
    console.log('Province Changed:', provinceCode)
    
    form.setValue('city', '')
    form.setValue('barangay', '')
    form.setValue('postalCode', '')
    
    const cityData = await fetchCities(provinceCode)
    setCities(cityData)
  }

  const handleCityChange = async (cityCode: string) => {
    // Clear dependent fields
    form.setValue('barangay', '')
    form.setValue('postalCode', '')
    setBarangays([])
    
    try {
      const barangayData = await fetchBarangays(cityCode)
      setBarangays(barangayData)
    } catch (error) {
      console.error('Error fetching barangays:', error)
      toast.error('Failed to fetch barangays')
    }
  }
  
  const handleBarangayChange = async (barangayCode: string) => {
    const selectedBarangay = barangays.find(brgy => brgy.code === barangayCode)
    const selectedCity = cities.find(city => city.code === form.getValues('city'))
    
    if (selectedBarangay && selectedCity) {
      const postalCode = findPostalCodeByBarangay(selectedBarangay.name, selectedCity.name)
      if (postalCode) {
        form.setValue('postalCode', postalCode)
      } else {
        form.setValue('postalCode', '') // Clear if no match found
      }
    }
  }

  // const handleBarangayChange = async (barangayCode: string) => {
  //   const selectedBarangay = barangays.find(brgy => brgy.code === barangayCode)
  //   const selectedCity = cities.find(city => city.code === form.getValues('city'))
    
  //   if (selectedBarangay && selectedCity) {
  //     const postalCode = findPostalCodeByBarangay(selectedBarangay.name, selectedCity.name)
  //     if (postalCode) {
  //       form.setValue('postalCode', postalCode)
  //     }
  //   }
  // }

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region <span className="text-red-500">*</span></FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleRegionChange(value)
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province <span className="text-red-500">*</span></FormLabel>
              {isNCR ? (
                <FormControl>
                  <Input 
                    {...field} 
                    value="Metro Manila" 
                    disabled 
                    className="bg-muted"
                  />
                </FormControl>
              ) : (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleProvinceChange(value)
                  }}
                  value={field.value}
                  disabled={!form.watch('region')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City/Municipality <span className="text-red-500">*</span></FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleCityChange(value)
                }}
                value={field.value}
                disabled={!form.watch('region') || (!isNCR && !form.watch('province'))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select City/Municipality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.code} value={city.code}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
        control={form.control}
        name="barangay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Barangay <span className="text-red-500">*</span></FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value)
                handleBarangayChange(value)
              }}
              value={field.value}
              disabled={!form.watch('city')}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select Barangay" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {barangays.map((barangay) => (
                  <SelectItem key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="houseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>House Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="House No." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  placeholder="Postal Code" 
                  {...field} 
                  disabled 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 