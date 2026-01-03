/**
 * API Client Tests
 */

import { api, APIClientError } from '@/lib/api/client';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful requests', () => {
    it('makes GET requests', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, name: 'Test' } }),
      });

      const result = await api.get('/api/users/1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/1'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('makes POST requests with body', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1 } }),
      });

      const result = await api.post('/api/users', { name: 'New User' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New User' }),
        })
      );
      expect(result).toEqual({ id: 1 });
    });

    it('includes query parameters in GET requests', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await api.get('/api/users', { params: { page: 1, limit: 10 } });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/page=1.*limit=10|limit=10.*page=1/),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('throws APIClientError on API error response', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
            statusCode: 404,
          },
        }),
      });

      await expect(api.get('/api/users/999')).rejects.toThrow(APIClientError);
      await expect(api.get('/api/users/999')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('handles network errors', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      await expect(api.get('/api/users')).rejects.toThrow(APIClientError);
      await expect(api.get('/api/users')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
    });
  });
});
