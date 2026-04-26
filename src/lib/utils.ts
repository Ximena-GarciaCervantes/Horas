// Utility Functions

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function calculateLostMinutes(plan: number, actual: number): number {
  if (plan <= 0) return 0;

  const lostMinutes = ((plan - actual) * 60) / plan;
  return lostMinutes > 0 ? parseFloat(lostMinutes.toFixed(1)) : 0;
}

export function getEfficiencyColor(
  efficiency: number,
  threshold: number = 95
): string {
  if (efficiency >= threshold) return 'bg-rk-green text-white';
  if (efficiency > 0 && efficiency < threshold) return 'bg-rk-red text-white';
  return 'bg-rk-light text-rk-dark';
}

export function getStatusColor(
  actual: number | null,
  plan: number | null
): string {
  if (!actual || !plan) return 'bg-rk-light';
  const efficiency = (actual / plan) * 100;
  if (efficiency >= 95) return 'bg-rk-green';
  if (efficiency >= 80) return 'bg-yellow-400';
  return 'bg-rk-red';
}

export function generateTimeSlots(
  startHour: number = 18,
  endHour: number = 6
): number[] {
  const slots: number[] = [];
  if (startHour <= endHour) {
    // Normal range (e.g., 6-19)
    for (let i = startHour; i < endHour; i++) {
      slots.push(i);
    }
  } else {
    // Overnight wrap (e.g., 18-6 next day)
    for (let i = startHour; i <= 23; i++) {
      slots.push(i);
    }
    for (let i = 0; i < endHour; i++) {
      slots.push(i);
    }
  }
  return slots;
}

export function calculateAccumulated(
  hourlyData: Array<{ hour: number; value: number }>,
  currentHour: number
): number {
  return hourlyData
    .filter((h) => h.hour <= currentHour)
    .reduce((sum, h) => sum + (h.value || 0), 0);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format time display (6:00 AM format)
export function formatHour(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}

// Validate number input
export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

// NSR (No hay dato de Reanudacion)
export function shouldShowNSR(
  hourIndex: number,
  dataExists: boolean
): boolean {
  return hourIndex === 0 && !dataExists;
}
