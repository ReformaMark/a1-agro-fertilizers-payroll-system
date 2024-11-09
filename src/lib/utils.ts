/* eslint-disable @typescript-eslint/no-unused-vars */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConvexErrorMessage(error: Error): string {
  try {
    // If it's not a string, return default message
    if (typeof error.message !== 'string') {
      return "Something went wrong";
    }

    // If message contains ConvexError, extract it
    if (error.message.includes("ConvexError:")) {
      // Split the message by "ConvexError:"
      const parts = error.message.split("ConvexError:");

      if (parts.length < 2) return "Something went wrong";

      // Get the part after "ConvexError:"
      let errorMessage = parts[1].trim();

      // Remove everything after "at handler" if it exists
      const handlerIndex = errorMessage.indexOf(" at handler");
      if (handlerIndex !== -1) {
        errorMessage = errorMessage.substring(0, handlerIndex);
      }

      // Clean up any remaining artifacts
      return errorMessage.replace(/\s+/g, ' ').trim();  
    }

    // If no ConvexError found, return the original message or default
    return error.message || "Something went wrong";
  } catch {
    // If any parsing fails, return default message
    return "Something went wrong";
  }
}

export function getCurrentTimePeriod(date: Date = new Date()): { start: Date; end: Date; formattedStart: string; formattedEnd: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Get last day of current month, accounting for varying month lengths
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // Will be 28/29 for Feb, 30 or 31 for others

  let startDay: number;
  let endDay: number;

  // First half of month
  if (day <= 15) {
    startDay = 1;
    endDay = 15;
  } 
  // Second half of month - use actual last day
  else {
    startDay = 16;
    endDay = lastDayOfMonth; // Will correctly use 29/30/31 as needed
  }

  // Create dates using the calculated days
  const start = new Date(year, month, startDay);
  const end = new Date(year, month, endDay);

  // Format dates consistently
  const dateFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  } as const;

  const formattedStart = start.toLocaleDateString('en-US', dateFormatOptions);
  const formattedEnd = end.toLocaleDateString('en-US', dateFormatOptions);

  return { start, end, formattedStart, formattedEnd };
}

interface ContributionResult {
  sss: {
    employeeShare: number;
    
    total: number;
  };
  philHealth: {
    employeeShare: number;
    employerShare: number;
    total: number;
  };
  pagIbig: {
    employeeShare: number;
    employerShare: number;
    total: number;
  };
  tax: number;
  totalDeductions: number;
}

export function calculateContributions(grossPay: number): ContributionResult {
  // SSS Calculation (simplified version using 14% total, 4.5% EE, 9.5% ER)
  const sssTotal = grossPay * 0.14;
  const sssEmployeeShare = grossPay * 0.045;
  // Tax calculation based on monthly income brackets
  let tax = 0;
  if (grossPay <= 20833) {
    tax = 0; // Tax exempt
  } else if (grossPay <= 33332) {
    tax = (grossPay - 20833) * 0.20;
  } else if (grossPay <= 66666) {
    tax = 2500 + ((grossPay - 33333) * 0.25);
  } else if (grossPay <= 166666) {
    tax = 10833 + ((grossPay - 66666) * 0.30);
  } else if (grossPay <= 666666) {
    tax = 40833 + ((grossPay - 166666) * 0.32);
  } else {
    tax = 200833 + ((grossPay - 666666) * 0.35);
  }

  // PhilHealth Calculation (4% total split equally)
  const philHealthTotal = grossPay * 0.04;
  const philHealthShare = philHealthTotal / 2;

  // Pag-IBIG Calculation (2% up to 5000 cap)
  const pagIbigBase = Math.min(grossPay, 5000);
  const pagIbigTotal = pagIbigBase * 0.02;
  const pagIbigShare = Math.min(pagIbigTotal / 2, 100);

  const result: ContributionResult = {
    sss: {
      employeeShare: sssEmployeeShare,
     
      total: sssTotal
    },
    philHealth: {
      employeeShare: philHealthShare,
      employerShare: philHealthShare,
      total: philHealthTotal
    },
    pagIbig: {
      employeeShare: pagIbigShare,
      employerShare: pagIbigShare,
      total: pagIbigShare * 2
    },
    tax: tax,
    totalDeductions: sssEmployeeShare + philHealthShare + pagIbigShare
  };

  return result;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateEmployeeId(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(3, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(2, '0').slice(0, 2)
  
  return `${year}${month}${seconds}${milliseconds}`
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
