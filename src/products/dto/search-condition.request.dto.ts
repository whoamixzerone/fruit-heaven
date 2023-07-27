import { SorterCondition } from '../sorter-condition.enum';

export class SearchConditionRequestDto {
  tit: string;

  limit: number;

  sorter: SorterCondition;
}
