export async function GET() {
  return Response.json(
    { status: 'ok', service: 'inova-ride-frontend' },
    { status: 200 },
  );
}
