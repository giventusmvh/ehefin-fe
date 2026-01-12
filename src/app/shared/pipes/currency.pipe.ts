import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrency } from '../utils/format.utils';

/**
 * Pipe to format a number as Indonesian Rupiah currency
 * Usage: {{ amount | currencyId }}
 */
@Pipe({
  name: 'currencyId',
  standalone: true,
})
export class CurrencyIdPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '-';
    return formatCurrency(value);
  }
}
