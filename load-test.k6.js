import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1000,
  duration: '30s',
};

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3000/users/7b6ce604-63ce-4b07-8c9b-946e314a43ae';

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
