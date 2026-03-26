// Group 5 Team Members Data
const teamMembers = [
  { name: "许涵茜", id: "25149923G", contribution: "组长，项目管理，文档检索，小组讨论" },
  { name: "赵珊禾", id: "25149861G", contribution: "文本写作，文档研究，网页开发，AI模拟，小组讨论" },
  { name: "詹昌昊", id: "25150816G", contribution: "头脑风暴，反馈修订，文档研究，小组讨论" },
  { name: "易斯鹏", id: "25148316G", contribution: "小组讨论" },
  { name: "张智源", id: "25150114G", contribution: "小组讨论" },
];

function renderTeamTable() {
  const tbody = document.getElementById('team-tbody');
  if (!tbody) return;
  teamMembers.forEach(member => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${member.name}</td>
      <td>${member.id}</td>
      <td>${member.contribution}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', renderTeamTable);
