// Placeholder — a tela real de lista de clientes chega na TASK-03.6. Existe aqui só para
// que `(protected)/layout.tsx` tenha uma rota de verdade para validar sessão (sem ela, um
// caminho inexistente cai no 404 global do Next.js, que não passa pelo layout protegido).
export default function ClientesPage() {
  return <p>Clientes.</p>;
}
