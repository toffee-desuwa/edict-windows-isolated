import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { api } from '../api';

export default function SkillsConfig() {
  const agentConfig = useStore((s) => s.agentConfig);
  const loadAgentConfig = useStore((s) => s.loadAgentConfig);
  const toast = useStore((s) => s.toast);

  const [skillModal, setSkillModal] = useState<{ agentId: string; name: string; content: string; path: string } | null>(null);
  const [addForm, setAddForm] = useState<{ agentId: string; agentLabel: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', desc: '', trigger: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAgentConfig();
  }, [loadAgentConfig]);

  const openSkill = async (agentId: string, skillName: string) => {
    setSkillModal({ agentId, name: skillName, content: '⟳ 加载中…', path: '' });
    try {
      const r = await api.skillContent(agentId, skillName);
      if (r.ok) {
        setSkillModal({ agentId, name: skillName, content: r.content || '', path: r.path || '' });
      } else {
        setSkillModal({ agentId, name: skillName, content: '❌ ' + (r.error || '无法读取'), path: '' });
      }
    } catch {
      setSkillModal({ agentId, name: skillName, content: '❌ 服务器连接失败', path: '' });
    }
  };

  const openAddForm = (agentId: string, agentLabel: string) => {
    setAddForm({ agentId, agentLabel });
    setFormData({ name: '', desc: '', trigger: '' });
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm || !formData.name) return;
    setSubmitting(true);
    try {
      const r = await api.addSkill(addForm.agentId, formData.name, formData.desc, formData.trigger);
      if (r.ok) {
        toast(`✅ 技能 ${formData.name} 已添加到 ${addForm.agentLabel}`, 'ok');
        setAddForm(null);
        loadAgentConfig();
      } else {
        toast(r.error || '添加失败', 'err');
      }
    } catch {
      toast('服务器连接失败', 'err');
    }
    setSubmitting(false);
  };

  if (!agentConfig?.agents) {
    return <div className="empty">无法加载</div>;
  }

  return (
    <div>
      <div className="skills-grid">
        {agentConfig.agents.map((ag) => (
          <div className="sk-card" key={ag.id}>
            <div className="sk-hdr">
              <span className="sk-emoji">{ag.emoji || '🏛️'}</span>
              <span className="sk-name">{ag.label}</span>
              <span className="sk-cnt">{(ag.skills || []).length} 技能</span>
            </div>
            <div className="sk-list">
              {!(ag.skills || []).length ? (
                <div className="sk-empty">暂无 Skills</div>
              ) : (
                (ag.skills || []).map((sk) => (
                  <div className="sk-item" key={sk.name} onClick={() => openSkill(ag.id, sk.name)}>
                    <span className="si-name">📦 {sk.name}</span>
                    <span className="si-desc">{sk.description || '无描述'}</span>
                    <span className="si-arrow">›</span>
                  </div>
                ))
              )}
            </div>
            <div className="sk-add" onClick={() => openAddForm(ag.id, ag.label)}>
              ＋ 添加技能
            </div>
          </div>
        ))}
      </div>

      {/* Skill Content Modal */}
      {skillModal && (
        <div className="modal-bg open" onClick={() => setSkillModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSkillModal(null)}>✕</button>
            <div className="modal-body">
              <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.04em', marginBottom: 4 }}>
                {skillModal.agentId.toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📦 {skillModal.name}</div>
              <div className="sk-modal-body">
                <div className="sk-md" style={{ whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.7 }}>
                  {skillModal.content}
                </div>
                {skillModal.path && (
                  <div className="sk-path" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 12 }}>
                    📂 {skillModal.path}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Form Modal */}
      {addForm && (
        <div className="modal-bg open" onClick={() => setAddForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAddForm(null)}>✕</button>
            <div className="modal-body">
              <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.04em', marginBottom: 4 }}>
                为 {addForm.agentLabel} 添加技能
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>＋ 新增 Skill</div>

              <div
                style={{
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 18,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: 'var(--muted)',
                }}
              >
                <b style={{ color: 'var(--text)' }}>📋 Skill 规范说明</b>
                <br />
                • 技能名称使用<b style={{ color: 'var(--text)' }}>小写英文 + 连字符</b>
                <br />
                • 创建后会生成模板文件 SKILL.md
                <br />
                • 技能会在 agent 收到相关任务时<b style={{ color: 'var(--text)' }}>自动激活</b>
              </div>

              <form onSubmit={submitAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    技能名称 <span style={{ color: '#ff5270' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如 data-analysis, code-review"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>技能描述</label>
                  <input
                    type="text"
                    placeholder="一句话说明用途"
                    value={formData.desc}
                    onChange={(e) => setFormData((p) => ({ ...p, desc: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>触发条件（可选）</label>
                  <input
                    type="text"
                    placeholder="何时激活此技能"
                    value={formData.trigger}
                    onChange={(e) => setFormData((p) => ({ ...p, trigger: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      color: 'var(--text)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" className="btn btn-g" onClick={() => setAddForm(null)} style={{ padding: '8px 20px' }}>
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '8px 20px',
                      fontSize: 13,
                      background: 'var(--acc)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {submitting ? '⟳ 创建中…' : '📦 创建技能'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
