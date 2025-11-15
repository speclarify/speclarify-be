import { NotificationDocument } from '../modules/notification/notification.schema';

export class PageResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  firstPage: boolean;
  lastPage: boolean;

  constructor(
    items: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = items;
    this.totalItems = totalItems;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalItems / pageSize);
    this.firstPage = currentPage === 1;
    this.lastPage = currentPage === this.totalPages;
  }

  public static mapItems<S, D>(
    pageResponse: PageResponse<S>,
    mapper: (item: S) => D,
  ) {
    return new PageResponse<D>(
      pageResponse.items.map(mapper),
      pageResponse.totalItems,
      pageResponse.currentPage,
      pageResponse.pageSize,
    );
  }
}
