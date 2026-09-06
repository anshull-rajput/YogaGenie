from app.knowledge.yoga_data import POSES, ROUTINES


def retrieve(query: str, goal: str | None = None, limit: int = 6):
    q = query.lower()
    tokens = set(q.replace('-', ' ').split())
    scored = []
    synonyms = {
        'downward dog': ['adho', 'mukha', 'svanasana'], 'cobra': ['bhujangasana'],
        'tree': ['vrikshasana'], 'child': ['balasana'], 'bridge': ['setu', 'bandhasana'],
        'cat cow': ['marjariasana'], 'sleep': ['better-sleep', 'restorative'],
        'relax': ['stress-relief', 'breathing'], 'flexible': ['flexibility'],
        'strong': ['strength'], 'posture': ['posture'], 'weight': ['weight-loss', 'weight-gain']
    }
    for pose in POSES:
        searchable = ' '.join([
            pose['name'], pose['sanskrit'], *pose['goals'], *pose['target_areas'],
            *pose['benefits']
        ]).lower()
        score = 0
        if goal and goal in pose['goals']:
            score += 4
        score += sum(2 for token in tokens if len(token) > 2 and token in searchable)
        for key, terms in synonyms.items():
            if key in q and any(term in searchable for term in terms):
                score += 3
        if score:
            scored.append((score, pose))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [pose for _, pose in scored[:limit]] or POSES[:limit]


def retrieve_routines(query: str, goal: str | None = None, limit: int = 3):
    q = query.lower()
    ranked = []
    for routine in ROUTINES:
        score = (3 if goal and routine['goal'] == goal else 0)
        score += sum(2 for token in q.replace('-', ' ').split() if len(token) > 2 and token in routine['name'].lower())
        if score:
            ranked.append((score, routine))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return [routine for _, routine in ranked[:limit]]
