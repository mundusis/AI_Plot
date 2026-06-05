import{d as m}from"./createLucideIcon-RXTEwv1t.js";import{H as k,k as g,l as S}from"./index-sbL1iSHF.js";const w=k("session",()=>{const a=g(null),o=g(null),e=g(!1),t=g(0);let n=null;function s(){e.value=!0,t.value=0,n=setInterval(()=>{t.value++},1e3)}function c(){e.value=!1,n&&(clearInterval(n),n=null)}return{currentArchiveId:a,selectedApiId:o,isGenerating:e,generatingSeconds:t,startGenerating:s,stopGenerating:c}});async function d(a){const o=await m.archives.get(a);if(!o)return"";const e=[];o.promptStory&&e.push(o.promptStory),o.worldSetting&&e.push(`【初始世界观】
${o.worldSetting}`),o.writingStyle&&e.push(`【文笔要求】
${o.writingStyle}`),o.outputLimit&&e.push(`【字数要求】
${o.outputLimit}`);for(const n of o.privateConfigs)e.push(`【${n.key}】
${n.value}`);for(const n of o.worldConfigs)e.push(`【${n.key}】
${n.value}`);for(const n of o.referencedSystemConfigKeys){const s=await m.systemConfigs.where("key").equals(n).first();s&&e.push(`【${s.key}】
${s.value}`)}const t=o.memory;return(t.currentStatus||t.plotLine||t.characters||t.relations||t.keyInfo)&&e.push(`【当前剧情记忆】
当前状态：${t.currentStatus}
完整剧情脉络：${t.plotLine}
出现过的角色：${t.characters}
关键角色关系：${t.relations}
关键信息：${t.keyInfo}`),e.join(`

`)}async function C(a){return(await m.messages.where("[archiveId+summaryStatus]").anyOf([[a,"未操作"],[a,"已跳过"]]).sortBy("timestamp")).map(e=>({role:e.role,content:e.content}))}async function $(a,o,e,t){var p,f,i,h;const n=w(),s=await m.apiConfigs.get(n.selectedApiId);if(!s)throw new Error("未选择 API 配置");const c=[{role:"system",content:o},...e,{role:"user",content:t}],r=await fetch(`${s.baseUrl}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.apiKey}`},body:JSON.stringify({model:s.model,temperature:s.temperature,messages:c})});if(!r.ok)throw new Error(`API 请求失败: ${r.status}`);const u=await r.json();return{content:u.choices[0].message.content,usage:{promptTokens:((p=u.usage)==null?void 0:p.prompt_tokens)??0,cachedTokens:((i=(f=u.usage)==null?void 0:f.prompt_tokens_details)==null?void 0:i.cached_tokens)??0,completionTokens:((h=u.usage)==null?void 0:h.completion_tokens)??0}}}function A(){async function a(t,n){const s=w(),c=S();s.startGenerating();try{const r=await d(t),u=await C(t),p=await $(t,r,u,n),f=await m.messages.add({archiveId:t,role:"assistant",content:p.content,timestamp:Date.now(),summaryStatus:"未操作"}),i=await m.archives.get(t);return i&&await m.archives.update(t,{tokenStats:{missCost:i.tokenStats.missCost+(p.usage.promptTokens-p.usage.cachedTokens),hitCost:i.tokenStats.hitCost+p.usage.cachedTokens,outputCost:i.tokenStats.outputCost+p.usage.completionTokens}}),f}catch(r){const u=r instanceof Error?r.message:"AI 请求失败，请重试";throw c.showToast(u,"error"),r}finally{s.stopGenerating()}}async function o(t,n,s){const c=await m.archives.get(t),r=(c==null?void 0:c.promptSummary)||"请对以下内容进行总结。",u=n.map(l=>`[${l.role==="user"?"用户":"AI"}]: ${l.content.substring(0,200)}`).join(`

`),p=`
当前状态：${s.currentStatus}
完整剧情脉络：${s.plotLine}
出现过的角色：${s.characters}
关键角色关系：${s.relations}
关键信息：${s.keyInfo}`,f=`${r}

【现有记忆】
${p}

【新对话内容】
${u}`,i=w(),h=S();i.startGenerating();try{const l=await d(t),y=await $(t,l,[],f);return i.stopGenerating(),L(y.content)}catch(l){i.stopGenerating();const y=l instanceof Error?l.message:"总结请求失败";throw h.showToast(y,"error"),l}}async function e(t,n){const s=await fetch(`${t}/v1/models`,{headers:{Authorization:`Bearer ${n}`}});if(!s.ok)throw new Error("获取模型列表失败");return((await s.json()).data||[]).map(r=>r.id)}return{executeAiInference:a,callSummaryLLM:o,fetchModels:e}}function L(a){const o=a.split(/\n(?=当前状态：|完整剧情脉络：|出现过的角色：|关键角色关系：|关键信息：)/),e={currentStatus:"",plotLine:"",characters:"",relations:"",keyInfo:""};for(const t of o)t.startsWith("当前状态：")?e.currentStatus=t.replace("当前状态：","").trim():t.startsWith("完整剧情脉络：")?e.plotLine=t.replace("完整剧情脉络：","").trim():t.startsWith("出现过的角色：")?e.characters=t.replace("出现过的角色：","").trim():t.startsWith("关键角色关系：")?e.relations=t.replace("关键角色关系：","").trim():t.startsWith("关键信息：")&&(e.keyInfo=t.replace("关键信息：","").trim());return e}export{w as a,A as u};
