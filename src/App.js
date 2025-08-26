import React, { useState, useEffect } from 'react';
import { Shield, Sword, Heart, Zap, Star, Skull, Target, Eye } from 'lucide-react';

import cathedralBg from './assets/images/cathedral-background.png';
import magnusImg from './assets/images/magnus-warrior.png';
import seraphimImg from './assets/images/seraphim-cleric.png';
import shadowImg from './assets/images/shadow-rogue.png';
import ariaImg from './assets/images/aria-wizard.png';
import bossImg from './assets/images/xiuhtecuhtli-boss.png';

const RPGBattle = () => {
  // Definición de personajes
  const initialHeroes = [
    {
      id: 1,
      name: "Magnus",
      class: "Guerrero",
      hp: 120,
      maxHp: 120,
      mp: 20,
      maxMp: 20,
      attack: 25,
      defense: 18,
      icon: Sword,
      sprite: magnusImg,
      skills: [
        { name: "Golpe Devastador", cost: 8, damage: 35, type: "physical" },
        { name: "Escudo Férreo", cost: 5, type: "defense", buff: 10 }
      ]
    },
    {
      id: 2,
      name: "Aria",
      class: "Mago",
      hp: 80,
      maxHp: 80,
      mp: 100,
      maxMp: 100,
      attack: 30,
      defense: 8,
      icon: Star,
      sprite: ariaImg,
      skills: [
        { name: "Bola de Fuego", cost: 15, damage: 40, type: "magic" },
        { name: "Rayo Cósmico", cost: 25, damage: 55, type: "magic" }
      ]
    },
    {
      id: 3,
      name: "Seraphim",
      class: "Sacerdote",
      hp: 90,
      maxHp: 90,
      mp: 80,
      maxMp: 80,
      attack: 15,
      defense: 12,
      icon: Heart,
      sprite: seraphimImg,
      skills: [
        { name: "Curación Divina", cost: 12, heal: 45, type: "heal" },
        { name: "Bendición", cost: 8, type: "buff", buff: 8 }
      ]
    },
    {
      id: 4,
      name: "Shadow",
      class: "Pícaro",
      hp: 100,
      maxHp: 100,
      mp: 40,
      maxMp: 40,
      attack: 28,
      defense: 14,
      icon: Target,
      sprite: shadowImg,
      skills: [
        { name: "Ataque Sombra", cost: 10, damage: 32, type: "physical", critChance: 0.3 },
        { name: "Veneno Letal", cost: 15, damage: 20, type: "poison", dots: 3 }
      ]
    }
  ];

  const boss = {
    name: "Xiuhtecuhtli-9",
    title: "El Androide Semidiós",
    hp: 800,
    maxHp: 800,
    attack: 35,
    defense: 15,
    phase: 1,
    maxPhase: 3,
    icon: Eye,
    sprite: bossImg,  
    skills: [
      { name: "Descarga Bioeléctrica", damage: 45, target: "single", element: "bio" },
      { name: "Lluvia de Cometas", damage: 30, target: "all", element: "cosmic" },
      { name: "Destello Cósmico", damage: 40, target: "random", element: "light", blind: true },
      { name: "Terremoto Sísmico", damage: 35, target: "all", element: "earth" },
      { name: "Ácido Corrosivo", damage: 25, target: "single", element: "acid", dots: 4 }
    ]
  };

  // Estados del juego
  const [heroes, setHeroes] = useState(initialHeroes);
  const [enemy, setEnemy] = useState(boss);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [gamePhase, setGamePhase] = useState('cinematic'); // cinematic, battle, victory, defeat
  const [turnOrder, setTurnOrder] = useState([]);
  const [statusEffects, setStatusEffects] = useState({});
  const [cinematicStep, setCinematicStep] = useState(0);

  // Inicializar orden de turnos
  useEffect(() => {
    const order = [...heroes.map(h => ({ ...h, type: 'hero' })), { ...enemy, type: 'enemy' }]
      .sort((a, b) => Math.random() - 0.5);
    setTurnOrder(order);
  }, []);

  // Función para agregar al log
  const addToLog = (message) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  // Función para aplicar daño
  const dealDamage = (target, damage, type = 'physical') => {
    const actualDamage = Math.max(1, damage - (target.defense / 2));
    return Math.floor(actualDamage * (0.8 + Math.random() * 0.4));
  };

  // Función para curar
  const healTarget = (target, healAmount) => {
    const actualHeal = Math.min(healAmount, target.maxHp - target.hp);
    return actualHeal;
  };

  // Ejecutar acción del héroe
  const executeHeroAction = (heroId, action, targetId = null) => {
    const hero = heroes.find(h => h.id === heroId);
    if (!hero || hero.hp <= 0) return;

    if (action.type === 'attack') {
      const damage = dealDamage(enemy, hero.attack);
      setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
      addToLog(`${hero.name} ataca a ${enemy.name} causando ${damage} de daño!`);
    } 
    else if (action.type === 'skill') {
      // Verificar MP
      if (hero.mp < action.cost) {
        addToLog(`${hero.name} no tiene suficiente MP para usar ${action.name}!`);
        return;
      }

      // Reducir MP
      setHeroes(prev => prev.map(h => 
        h.id === heroId ? { ...h, mp: Math.max(0, h.mp - action.cost) } : h
      ));

      // Habilidades de daño
      if (action.damage && !action.heal) {
        let finalDamage = action.damage;
        
        // Verificar crítico
        if (action.critChance && Math.random() < action.critChance) {
          finalDamage = Math.floor(finalDamage * 1.5);
          addToLog(`¡${hero.name} hace un golpe crítico!`);
        }
        
        const actualDamage = dealDamage(enemy, finalDamage);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - actualDamage) }));
        addToLog(`${hero.name} usa ${action.name} causando ${actualDamage} de daño!`);
        
        if (action.dots) {
          addToLog(`${enemy.name} está envenenado por ${action.dots} turnos!`);
        }
      }
      // Habilidades de curación
      else if (action.heal) {
        const target = targetId ? heroes.find(h => h.id === targetId) : hero;
        if (target) {
          const healAmount = Math.min(action.heal, target.maxHp - target.hp);
          setHeroes(prev => prev.map(h => 
            h.id === target.id ? { ...h, hp: Math.min(h.maxHp, h.hp + healAmount) } : h
          ));
          addToLog(`${hero.name} usa ${action.name} curando ${healAmount} HP a ${target.name}!`);
        }
      }
      // Habilidades de buff
      else if (action.buff) {
        setHeroes(prev => prev.map(h => 
          h.id === heroId ? { 
            ...h, 
            attack: h.attack + action.buff,
            defense: h.defense + action.buff 
          } : h
        ));
        addToLog(`${hero.name} usa ${action.name} aumentando su poder por ${action.buff} puntos!`);
      }
    }

    nextTurn();
  };

  // Ejecutar acción del enemigo
  const executeEnemyAction = () => {
    if (enemy.hp <= 0) return;

    const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    
    if (skill.target === 'single' || skill.target === 'random') {
      const aliveHeroes = heroes.filter(h => h.hp > 0);
      if (aliveHeroes.length === 0) return;
      
      const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
      const damage = dealDamage(target, skill.damage);
      
      setHeroes(prev => prev.map(h => 
        h.id === target.id ? { ...h, hp: Math.max(0, h.hp - damage) } : h
      ));
      
      addToLog(`${enemy.name} usa ${skill.name} contra ${target.name} causando ${damage} de daño!`);
    } else if (skill.target === 'all') {
      const damage = skill.damage;
      setHeroes(prev => prev.map(h => ({
        ...h,
        hp: h.hp > 0 ? Math.max(0, h.hp - dealDamage(h, damage)) : 0
      })));
      addToLog(`${enemy.name} usa ${skill.name} contra todo el grupo!`);
    }

    nextTurn();
  };

  // Siguiente turno
  const nextTurn = () => {
    setCurrentTurn(prev => (prev + 1) % (heroes.length + 1));
    setSelectedAction(null);
    setSelectedTarget(null);
  };

  // Verificar condiciones de victoria/derrota
  useEffect(() => {
    if (gamePhase === 'battle') {
      if (enemy.hp <= 0) {
        setGamePhase('victory');
        addToLog('¡Victoria! Los héroes han derrotado a Xiuhtecuhtli-9!');
      } else if (heroes.every(h => h.hp <= 0)) {
        setGamePhase('defeat');
        addToLog('Derrota... Los héroes han caído...');
      }
    }
  }, [heroes, enemy.hp, gamePhase]);

  // Turno automático del enemigo
  useEffect(() => {
    if (currentTurn === heroes.length && gamePhase === 'battle' && enemy.hp > 0) {
      const timer = setTimeout(executeEnemyAction, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gamePhase, enemy.hp]);

  // Cambio de fase del jefe
  useEffect(() => {
    if (gamePhase === 'battle' && enemy.hp > 0) {
      const hpPercentage = enemy.hp / enemy.maxHp;
      let newPhase = 1;
      if (hpPercentage <= 0.66) newPhase = 2;
      if (hpPercentage <= 0.33) newPhase = 3;
      
      if (newPhase !== enemy.phase) {
        setEnemy(prev => ({ ...prev, phase: newPhase }));
        addToLog(`¡Xiuhtecuhtli-9 entra en fase ${newPhase}! Su poder aumenta...`);
      }
    }
  }, [enemy.hp, enemy.phase, gamePhase]);

  // Historia cinemática
  const cinematicStory = [
    {
      title: "Hace 1500 años...",
      text: "Un ser de las estrellas cayó del cosmos, perdido en la inmensidad del espacio. Su nave se estrelló en las tierras del gran Imperio Azteca.",
      bg: "from-purple-900 to-blue-900"
    },
    {
      title: "El Dios Caído",
      text: "Los originarios lo encontraron herido y lo acogieron como a una deidad. Lo llamaron el 'Portador de las Estrellas' y le construyeron un templo sagrado.",
      bg: "from-yellow-600 to-orange-800"
    },
    {
      title: "La Invasión",
      text: "Pero llegaron los conquistadores españoles. El templo fue destruido, y Hernán Cortés robó en secreto al ser alienígena, llevándolo a España.",
      bg: "from-red-800 to-gray-900"
    },
    {
      title: "500 Años de Cautiverio",
      text: "En las profundidades del Vaticano, fue mantenido en un sueño profundo. Los hombres le temían, pero no podían destruir lo que no comprendían.",
      bg: "from-gray-800 to-black"
    },
    {
      title: "El Despertar",
      text: "Una visión perturbó su letargo. Despertó lleno de ira, destruyó todo a su alrededor y encontró una sala secreta con tecnología prohibida.",
      bg: "from-red-600 to-purple-800"
    },
    {
      title: "La Máquina del Tiempo",
      text: "Con sus últimas fuerzas, utilizó la máquina temporal para volver al pasado. Su misión era clara: venganza y destrucción.",
      bg: "from-cyan-600 to-blue-800"
    },
    {
      title: "Sumeria Antigua",
      text: "Llegó a la época sumeria para recuperarse y planear. Viajó al futuro año 3500 para obtener tecnología avanzada y crear un ejército de bioandrides.",
      bg: "from-green-700 to-teal-800"
    },
    {
      title: "Atrapado en el Tiempo",
      text: "Pero la máquina se rompió al volver. Quedó atrapado en el pasado, creciendo en poder durante siglos, alimentando su sed de venganza.",
      bg: "from-orange-700 to-red-800"
    },
    {
      title: "Italia, 1450",
      text: "Ahora, transformado en Xiuhtecuhtli-9, un androide semidiós, ha decidido que es hora de atacar. Italia será el primer paso de su conquista.",
      bg: "from-purple-800 to-red-900"
    },
    {
      title: "Los Últimos Héroes",
      text: "Cuatro valientes se alzan para enfrentar esta amenaza cósmica. El destino de la humanidad descansa en sus manos...",
      bg: "from-blue-800 to-purple-900"
    }
  ];

  // Avanzar cinemática
  const nextCinematicStep = () => {
    if (cinematicStep < cinematicStory.length - 1) {
      setCinematicStep(cinematicStep + 1);
    } else {
      setGamePhase('battle');
    }
  };

  const skipCinematic = () => {
    setGamePhase('battle');
  };

  const currentHero = currentTurn < heroes.length ? heroes[currentTurn] : null;

  // Renderizar cinemática
  if (gamePhase === 'cinematic') {
    const currentStory = cinematicStory[cinematicStep];
    return (
      <div className={`min-h-screen bg-gradient-to-b ${currentStory.bg} text-white flex items-center justify-center p-4`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent animate-pulse">
              {currentStory.title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-white mx-auto mb-8"></div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 mb-8 border border-white/20">
            <p className="text-xl leading-relaxed text-gray-100">
              {currentStory.text}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={nextCinematicStep}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              {cinematicStep < cinematicStory.length - 1 ? 'Continuar' : 'Comenzar Batalla'}
            </button>
            
            <button
              onClick={skipCinematic}
              className="bg-gray-600 hover:bg-gray-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              Saltar Historia
            </button>
          </div>

          <div className="mt-8 flex justify-center space-x-2">
            {cinematicStory.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === cinematicStep ? 'bg-white' : 'bg-white/30'
                } transition-colors`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
  className="min-h-screen text-white p-4 relative"
  style={{
    backgroundImage: `url(${cathedralBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>
  <div className="absolute inset-0 bg-black/40"></div>
  <div className="relative z-10">
      {/* Título */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Los Últimos Héroes vs Xiuhtecuhtli-9
        </h1>
        <p className="text-blue-300">Italia, 1450 - El Destino de la Humanidad se Decide</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Enemigo */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden">
            <img 
              src={enemy.sprite} 
              alt={enemy.name}
              className="w-full h-full object-cover"
            />
          </div>
            <div className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
              Fase {enemy.phase}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{enemy.name}</h2>
          <p className="text-gray-300 mb-4">{enemy.title}</p>
          <div className="w-64 mx-auto bg-gray-800 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm">{enemy.hp} / {enemy.maxHp} HP</p>
        </div>

        {/* Héroes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {heroes.map((hero, index) => {
            const IconComponent = hero.icon;
            const isCurrentTurn = currentTurn === index && gamePhase === 'battle';
            const isAlive = hero.hp > 0;
            
            return (
              <div 
                key={hero.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentTurn ? 'border-yellow-400 bg-blue-900/50 scale-105' : 'border-gray-600 bg-gray-800/50'
                } ${!isAlive ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="text-center mb-3">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-400">
                    <img 
                      src={hero.sprite} 
                      alt={hero.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold">{hero.name}</h3>
                  <p className="text-xs text-gray-400">{hero.class}</p>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>HP</span>
                      <span>{hero.hp}/{hero.maxHp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>MP</span>
                      <span>{hero.mp}/{hero.maxMp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(hero.mp / hero.maxMp) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        {gamePhase === 'battle' && currentHero && currentHero.hp > 0 && (
          <div className="bg-gray-800/70 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-4 text-center">Turno de {currentHero.name}</h3>
            
            {!selectedAction && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedAction({ type: 'attack', name: 'Ataque Básico' })}
                  className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Sword className="w-4 h-4" />
                  Atacar
                </button>
                
                <div className="space-y-2">
                  {currentHero.skills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAction({ ...skill, type: 'skill' })}
                      disabled={currentHero.mp < skill.cost}
                      className={`w-full px-3 py-2 rounded font-semibold transition-colors text-sm flex items-center justify-between ${
                        currentHero.mp < skill.cost 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <span>{skill.name}</span>
                      <span className="text-xs">({skill.cost} MP)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAction && selectedAction.type === 'attack' && (
              <div className="text-center">
                <p className="mb-4">Atacando a {enemy.name}...</p>
                <button
                  onClick={() => executeHeroAction(currentHero.id, selectedAction)}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Confirmar Ataque
                </button>
              </div>
            )}

            {selectedAction && selectedAction.heal && (
              <div>
                <p className="mb-4 text-center">Selecciona el objetivo para {selectedAction.name}:</p>
                <div className="grid grid-cols-4 gap-2">
                  {heroes.filter(h => h.hp > 0).map(hero => (
                    <button
                      key={hero.id}
                      onClick={() => executeHeroAction(currentHero.id, selectedAction, hero.id)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
                    >
                      {hero.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAction && !selectedAction.heal && selectedAction.type !== 'attack' && (
              <div className="text-center">
                <p className="mb-4">Usando {selectedAction.name}...</p>
                <button
                  onClick={() => executeHeroAction(currentHero.id, selectedAction)}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Confirmar
                </button>
              </div>
            )}

            {selectedAction && (
              <button
                onClick={() => setSelectedAction(null)}
                className="mt-4 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-semibold w-full"
              >
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* Log de batalla */}
        <div className="bg-black/50 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">Registro de Batalla</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {battleLog.map((message, index) => (
              <p key={index} className="text-sm text-gray-300">{message}</p>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {gamePhase !== 'battle' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              {gamePhase === 'victory' ? (
                <>
                  <h2 className="text-3xl font-bold text-green-400 mb-4">¡VICTORIA!</h2>
                  <p className="text-gray-300 mb-6">
                    Los héroes han salvado el mundo de la amenaza de Xiuhtecuhtli-9.
                    <br />La historia recordará su valentía por siempre.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-red-400 mb-4">DERROTA</h2>
                  <p className="text-gray-300 mb-6">
                    Los héroes han caído ante el poder de Xiuhtecuhtli-9.
                    <br />El mundo queda en sus manos metálicas...
                  </p>
                </>
              )}
                <button
                onClick={() => {
                  setCinematicStep(0);
                  setGamePhase('cinematic');
                  setHeroes([...initialHeroes]);
                  setEnemy({...boss});
                  setCurrentTurn(0);
                  setBattleLog([]);
                  setSelectedAction(null);
                  setSelectedTarget(null);
                  setStatusEffects({});
                }}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold mr-4"
              >
                Ver Historia Completa
              </button>
              <button
                onClick={() => {
                  setHeroes([...initialHeroes]);
                  setEnemy({...boss});
                  setCurrentTurn(0);
                  setBattleLog([]);
                  setGamePhase('battle');
                  setSelectedAction(null);
                  setSelectedTarget(null);
                  setStatusEffects({});
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
              >
                Batalla Rápida
              </button>
            </div>
          </div>
        )}
      </div>
      </div> {/* Cierra relative z-10 */}
    </div>
  );
};

export default RPGBattle;