import{d as m}from"./createLucideIcon-BqK5DMjR.js";import{J as k,k as g,l as d}from"./index-B5JuS7jO.js";const y=k("session",()=>{const i=g(null),n=g(null),e=g(!1),t=g(0);let o=null;function s(){e.value=!0,t.value=0,o=setInterval(()=>{t.value++},1e3)}function c(){e.value=!1,o&&(clearInterval(o),o=null)}return{currentArchiveId:i,selectedApiId:n,isGenerating:e,generatingSeconds:t,startGenerating:s,stopGenerating:c}});async function $(i){const n=await m.archives.get(i);if(!n)return"";const e=[];n.promptStory&&e.push(n.promptStory);for(const o of n.referencedSystemConfigKeys){const s=await m.systemConfigs.where("key").equals(o).first();s&&e.push(`【${s.key}】
${s.value}`)}for(const o of n.privateConfigs)e.push(`【${o.key}】
${o.value}`);n.worldSetting&&e.push(`【初始世界观】
${n.worldSetting}`);for(const o of n.worldConfigs)e.push(`【${o.key}】
${o.value}`);const t=n.memory;return(t.currentStatus||t.plotLine||t.characters||t.relations||t.keyInfo)&&e.push(`【当前剧情记忆】
当前状态：${t.currentStatus}
完整剧情脉络：${t.plotLine}
出现过的角色：${t.characters}
关键角色关系：${t.relations}
关键信息：${t.keyInfo}`),e.join(`

`)}async function C(i){return(await m.messages.where({archiveId:i,summaryStatus:"未操作"}).sortBy("timestamp")).map(e=>({role:e.role,content:e.content}))}async function w(i,n,e,t){var l,f,a,h;const o=y(),s=await m.apiConfigs.get(o.selectedApiId);if(!s)throw new Error("未选择 API 配置");const c=[{role:"system",content:n},...e,{role:"user",content:t}],r=await fetch(`${s.baseUrl}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.apiKey}`},body:JSON.stringify({model:s.model,temperature:s.temperature,messages:c})});if(!r.ok)throw new Error(`API 请求失败: ${r.status}`);const u=await r.json();return{content:u.choices[0].message.content,usage:{promptTokens:((l=u.usage)==null?void 0:l.prompt_tokens)??0,cachedTokens:((a=(f=u.usage)==null?void 0:f.prompt_tokens_details)==null?void 0:a.cached_tokens)??0,completionTokens:((h=u.usage)==null?void 0:h.completion_tokens)??0}}}function I(){async function i(t,o){const s=y(),c=d();s.startGenerating();try{const r=await $(t),u=await C(t),l=await w(t,r,u,o),f=await m.messages.add({archiveId:t,role:"assistant",content:l.content,timestamp:Date.now(),summaryStatus:"未操作"}),a=await m.archives.get(t);return a&&await m.archives.update(t,{tokenStats:{missCost:a.tokenStats.missCost+(l.usage.promptTokens-l.usage.cachedTokens),hitCost:a.tokenStats.hitCost+l.usage.cachedTokens,outputCost:a.tokenStats.outputCost+l.usage.completionTokens}}),f}catch(r){const u=r instanceof Error?r.message:"AI 请求失败，请重试";throw c.showToast(u,"error"),r}finally{s.stopGenerating()}}async function n(t,o,s){const c=await m.archives.get(t),r=(c==null?void 0:c.promptSummary)||"请对以下内容进行总结。",u=o.map(p=>`[${p.role==="user"?"用户":"AI"}]: ${p.content}`).join(`

`),f=`【现有记忆】
${`
当前状态：${s.currentStatus}
完整剧情脉络：${s.plotLine}
出现过的角色：${s.characters}
关键角色关系：${s.relations}
关键信息：${s.keyInfo}`}

【新对话内容】
${u}`,a=y(),h=d();a.startGenerating();try{const p=await w(t,r,[],f);return a.stopGenerating(),v(p.content)}catch(p){a.stopGenerating();const S=p instanceof Error?p.message:"总结请求失败";throw h.showToast(S,"error"),p}}async function e(t,o){const s=await fetch(`${t}/v1/models`,{headers:{Authorization:`Bearer ${o}`}});if(!s.ok)throw new Error("获取模型列表失败");return((await s.json()).data||[]).map(r=>r.id)}return{executeAiInference:i,callSummaryLLM:n,fetchModels:e}}function v(i){const n=i.split(/\n(?=当前状态：|完整剧情脉络：|出现过的角色：|关键角色关系：|关键信息：)/),e={currentStatus:"",plotLine:"",characters:"",relations:"",keyInfo:""};for(const t of n)t.startsWith("当前状态：")?e.currentStatus=t.replace("当前状态：","").trim():t.startsWith("完整剧情脉络：")?e.plotLine=t.replace("完整剧情脉络：","").trim():t.startsWith("出现过的角色：")?e.characters=t.replace("出现过的角色：","").trim():t.startsWith("关键角色关系：")?e.relations=t.replace("关键角色关系：","").trim():t.startsWith("关键信息：")&&(e.keyInfo=t.replace("关键信息：","").trim());return e}export{y as a,I as u};
