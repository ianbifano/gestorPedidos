// Validaciones y utilidades

export const Validators = {
  // Valida que un nombre sea válido (min 2 caracteres, sin números)
  nombre: (valor: string): { valid: boolean; error?: string } => {
    const trimmed = valor.trim();
    if (!trimmed) return { valid: false, error: 'El nombre es obligatorio' };
    if (trimmed.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' };
    if (trimmed.length > 100) return { valid: false, error: 'Máximo 100 caracteres' };
    if (/\d/.test(trimmed)) return { valid: false, error: 'No se permiten números' };
    return { valid: true };
  },

  // Valida teléfono (7-15 dígitos, espacios y guiones permitidos)
  telefono: (valor: string): { valid: boolean; error?: string } => {
    if (!valor.trim()) return { valid: true }; // Opcional
    const cleaned = valor.replace(/[\s-()]/g, '');
    if (!/^\d{7,15}$/.test(cleaned)) {
      return { valid: false, error: 'Teléfono inválido (7-15 dígitos)' };
    }
    return { valid: true };
  },

  // Valida email
  email: (valor: string): { valid: boolean; error?: string } => {
    if (!valor.trim()) return { valid: true }; // Opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(valor)) {
      return { valid: false, error: 'Email inválido' };
    }
    return { valid: true };
  },

  // Valida descripción
  descripcion: (valor: string): { valid: boolean; error?: string } => {
    const trimmed = valor.trim();
    if (!trimmed) return { valid: false, error: 'La descripción es obligatoria' };
    if (trimmed.length < 5) return { valid: false, error: 'Mínimo 5 caracteres' };
    if (trimmed.length > 500) return { valid: false, error: 'Máximo 500 caracteres' };
    return { valid: true };
  },

  // Valida monto
  monto: (valor: string | number): { valid: boolean; error?: string } => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(num)) return { valid: false, error: 'El monto debe ser un número' };
    if (num <= 0) return { valid: false, error: 'El monto debe ser mayor a 0' };
    if (num > 999999) return { valid: false, error: 'El monto es muy grande' };
    return { valid: true };
  },
};

// Sanitiza inputs (elimina caracteres peligrosos)
export function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '') // Elimina < y >
    .replace(/\n\n+/g, '\n') // Limita saltos de línea
    .substring(0, 500); // Límite de caracteres
}

// Normaliza teléfono (formatea para guardar)
export function normalizarTelefono(telefono: string): string {
  return telefono.replace(/[\s-()]/g, '').trim();
}

// Formatea teléfono para mostrar
export function formatearTelefono(telefono: string): string {
  const cleaned = normalizarTelefono(telefono);
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return cleaned;
}

// Verifica si dos teléfonos son iguales
export function telefonosIguales(tel1: string, tel2: string): boolean {
  return normalizarTelefono(tel1) === normalizarTelefono(tel2);
}

// Formatea monto a moneda
export function formatearMonto(monto: number): string {
  return `$${monto.toFixed(2)}`;
}

// Formatea fecha
export function formatearFecha(fecha: string | Date, formato: 'corta' | 'larga' = 'corta'): string {
  const date = new Date(fecha);
  if (formato === 'corta') {
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Calcula edad de un dato (ej: "hace 2 horas")
export function tiempoRelativo(fecha: string | Date): string {
  const date = new Date(fecha);
  const ahora = new Date();
  const diff = Math.floor((ahora.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Hace unos segundos';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  
  return formatearFecha(fecha, 'corta');
}
