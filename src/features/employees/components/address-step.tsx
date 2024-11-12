"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormStepProps } from "../lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays, Region, Province, City, Barangay } from "@/lib/address-api";
import { findPostalCodeByBarangay } from "@/lib/postal-codes";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function AddressStep({ form }: FormStepProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [isNCR, setIsNCR] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRegions().then(data => {
      setRegions(data)
      setIsLoading(false)
    })
  }, [])

  const handleRegionChange = async (regionCode: string) => {
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
        const cityData = await fetchCities('130000000')
        setCities(cityData)
      } catch (error) {
        console.error('Error fetching NCR cities:', error)
        toast.error('Failed to fetch cities')
      }
    } else {
      try {
        const provinceData = await fetchProvinces(regionCode)
        setProvinces(provinceData)
      } catch (error) {
        console.error('Error fetching provinces:', error)
        toast.error('Failed to fetch provinces')
      }
    }
  }

  const handleProvinceChange = async (provinceCode: string) => {
    form.setValue('city', '')
    form.setValue('barangay', '')
    form.setValue('postalCode', '')
    setBarangays([])
    
    try {
      const cityData = await fetchCities(provinceCode)
      setCities(cityData)
    } catch (error) {
      console.error('Error fetching cities:', error)
      toast.error('Failed to fetch cities')
    }
  }

  const handleCityChange = async (cityCode: string) => {
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

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="font-medium text-lg">Address Information</div>

      <div className="grid grid-cols-2 gap-4">
        {/* Region Field - Same as AddressInfoForm */}
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

        {/* Province Field - Same as AddressInfoForm */}
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
                disabled={!isNCR && !form.watch('province')}
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

      <div className="grid grid-cols-2 gap-4">
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
      </div>

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
                className="bg-muted"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}