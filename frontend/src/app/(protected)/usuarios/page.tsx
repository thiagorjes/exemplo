// Placeholder — a tela real de gestão de usuários chega na TASK-02.3. Existe aqui só para
// que `(protected)/layout.tsx` tenha uma rota de verdade para validar sessão (sem ela, um
// caminho inexistente cai no 404 global do Next.js, que não passa pelo layout protegido).
export default function UsuariosPage() {
  return <p>Gestão de usuários.</p>;
}
