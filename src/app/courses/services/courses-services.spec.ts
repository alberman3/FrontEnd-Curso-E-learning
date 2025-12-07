import { TestBed } from '@angular/core/testing';
import { CoursesServices } from './courses-services';

describe('CoursesServices', () => {
  let service: CoursesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoursesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
